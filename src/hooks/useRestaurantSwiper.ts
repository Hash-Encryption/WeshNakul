import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchDeckRestaurants, getRoomDecisionState, submitRestaurantVote } from '../lib/supabase';
import type { RestaurantItem, RestaurantVote } from '../types/restaurant';
import type { RestaurantSummary } from '../types/database';

interface SwiperProps {
  roomId: string;
  participantId: string;
  sessionToken: string;
  version: number;
  category: string;
  stage?: string;
  summary?: RestaurantSummary;
  onRefresh: () => Promise<void>;
  onMatched?: (winner: RestaurantItem) => void;
}

export function useRestaurantSwiper({roomId,participantId,sessionToken,version,category,stage='swiping',summary,onRefresh,onMatched}:SwiperProps) {
  const [traversal,setTraversal]=useState<{deck:RestaurantItem[];deckId:string|null;currentIndex:number}>({deck:[],deckId:null,currentIndex:0});
  const {deck,deckId,currentIndex}=traversal;
  const [isLoadingDeck,setIsLoadingDeck]=useState(true),[deckError,setDeckError]=useState<string|null>(null);
  const [myVotes,setMyVotes]=useState<Record<string,RestaurantVote>>({});
  const [showRoundTwoToast,setShowRoundTwoToast]=useState(false);
  const versionRef=useRef(version),queueRef=useRef<Promise<void>>(Promise.resolve()),pendingItemsRef=useRef(new Set<string>());

  useEffect(()=>{versionRef.current=Math.max(versionRef.current,version)},[version]);

  useEffect(()=>{
    if(stage!=='swiping'||!category||!roomId||!participantId||!sessionToken)return;
    let active=true;
    Promise.all([fetchDeckRestaurants(roomId,participantId,sessionToken),getRoomDecisionState(roomId,sessionToken)])
      .then(([nextDeck,state])=>{if(!active)return;setMyVotes(state.myVotes||{});setTraversal(current=>{
        const sameDeck=current.deckId===nextDeck.deckId,fresh=new Map(nextDeck.restaurants.map(item=>[item.id,item]));
        const ordered=sameDeck?[...current.deck.map(item=>fresh.get(item.id)).filter((item):item is RestaurantItem=>Boolean(item)),...nextDeck.restaurants.filter(item=>!current.deck.some(existing=>existing.id===item.id))]:nextDeck.restaurants;
        const start=sameDeck?current.currentIndex:0,pending=ordered.findIndex((item,index)=>index>=start&&!['YES','NO'].includes(state.myVotes?.[item.id]||''));
        return{deck:ordered,deckId:nextDeck.deckId,currentIndex:pending<0?ordered.length:pending};});
        setDeckError(nextDeck.restaurants.length?null:'NO_ELIGIBLE_RESTAURANTS');setIsLoadingDeck(false);})
      .catch(error=>{console.error('Failed to load authoritative decision state',error);if(active){setDeckError('DECK_UNAVAILABLE');setIsLoadingDeck(false);}});
    return()=>{active=false};
  },[stage,category,roomId,participantId,sessionToken,summary?.deckId]);

  const recordVote=useCallback((vote:RestaurantVote)=>{
    if(!deckId||currentIndex>=deck.length)return Promise.resolve();
    const item=deck[currentIndex];
    if(pendingItemsRef.current.has(item.id))return Promise.resolve();
    pendingItemsRef.current.add(item.id);
    const previousVote=myVotes[item.id];
    setMyVotes(current=>({...current,[item.id]:vote}));
    setTraversal(current=>current.deckId!==deckId||current.deck[current.currentIndex]?.id!==item.id?current:{...current,
        deck:vote==='LATER'?[...current.deck.slice(0,current.currentIndex),...current.deck.slice(current.currentIndex+1),item]:current.deck,
        currentIndex:vote==='LATER'?current.currentIndex:current.currentIndex+1});
    const submit=async()=>{const accept=async(state:Awaited<ReturnType<typeof submitRestaurantVote>>)=>{
      versionRef.current=Math.max(versionRef.current,state.room.version);
      setMyVotes(state.myVotes||{});
      if(state.room.stage==='matched')onMatched?.(item);
      const nextDeckId=state.room.restaurant_summary?.deckId;
      if(nextDeckId&&nextDeckId!==deckId){setShowRoundTwoToast(true);setIsLoadingDeck(true);}
      await onRefresh();
    };try{await accept(await submitRestaurantVote(roomId,sessionToken,versionRef.current,deckId,item.id,vote));
    }catch(error){let failure=error;
      if((failure as {code?:string})?.code==='PT409')try{
        const canonical=await getRoomDecisionState(roomId,sessionToken);versionRef.current=Math.max(versionRef.current,canonical.room.version);
        if(canonical.room.stage==='swiping'&&canonical.room.restaurant_summary?.deckId===deckId){
          await accept(await submitRestaurantVote(roomId,sessionToken,versionRef.current,deckId,item.id,vote));return;
        }
      }catch(retryError){failure=retryError}
      const isStale=(failure as {code?:string})?.code==='PT409';
      if(!isStale)console.error('Failed to record authoritative vote',failure);
      setTraversal(current=>{
        const index=current.deck.findIndex(card=>card.id===item.id);
        if(index<0)return current;
        const remaining=current.deck.filter(card=>card.id!==item.id),insertAt=Math.min(currentIndex,remaining.length);
        return{...current,deck:[...remaining.slice(0,insertAt),item,...remaining.slice(insertAt)],currentIndex:insertAt};
      });
      setMyVotes(current=>{const next={...current};if(previousVote)next[item.id]=previousVote;else delete next[item.id];return next});
      try{const canonical=await getRoomDecisionState(roomId,sessionToken);versionRef.current=Math.max(versionRef.current,canonical.room.version);setMyVotes(canonical.myVotes||{});}catch{/* refresh reports the original error */}
      await onRefresh();
      if(!isStale)setDeckError('DECK_UNAVAILABLE');
    }finally{pendingItemsRef.current.delete(item.id)}};
    const queued=queueRef.current.then(submit,submit);
    queueRef.current=queued.catch(()=>{});
    return queued;
  },[deckId,currentIndex,deck,myVotes,roomId,sessionToken,onMatched,onRefresh]);

  const isDeckFinished=deck.length>0&&deck.every(item=>['YES','NO'].includes(myVotes[item.id]||''));
  return {deck,currentIndex,totalCards:deck.length,isDeckFinished,isLoadingDeck,deckError,recordVote,
    summary,myVotes,showRoundTwoToast,dismissRoundTwoToast:()=>setShowRoundTwoToast(false)};
}
