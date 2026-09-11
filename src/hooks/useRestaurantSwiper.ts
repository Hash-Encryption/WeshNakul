import { useEffect, useState, useCallback } from 'react';
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
  const [deck,setDeck]=useState<RestaurantItem[]>([]),[deckId,setDeckId]=useState<string|null>(null);
  const [isLoadingDeck,setIsLoadingDeck]=useState(true),[deckError,setDeckError]=useState<string|null>(null);
  const [currentIndex,setCurrentIndex]=useState(0),[myVotes,setMyVotes]=useState<Record<string,RestaurantVote>>({});
  const [showRoundTwoToast,setShowRoundTwoToast]=useState(false);

  useEffect(()=>{
    if(stage!=='swiping'||!category||!roomId||!participantId||!sessionToken)return;
    let active=true;
    Promise.all([fetchDeckRestaurants(roomId,participantId,sessionToken),getRoomDecisionState(roomId,sessionToken)])
      .then(([nextDeck,state])=>{if(!active)return;setDeck(nextDeck.restaurants);setDeckId(nextDeck.deckId);setMyVotes(state.myVotes||{});
        const pending=nextDeck.restaurants.findIndex(item=>!['YES','NO'].includes(state.myVotes?.[item.id]||''));
        setCurrentIndex(pending<0?nextDeck.restaurants.length:pending);setDeckError(nextDeck.restaurants.length?null:'NO_ELIGIBLE_RESTAURANTS');setIsLoadingDeck(false);})
      .catch(error=>{console.error('Failed to load authoritative decision state',error);if(active){setDeckError('DECK_UNAVAILABLE');setIsLoadingDeck(false);}});
    return()=>{active=false};
  },[stage,category,roomId,participantId,sessionToken,version,summary?.deckId]);

  const recordVote=useCallback(async(vote:RestaurantVote)=>{
    if(!deckId||currentIndex>=deck.length)return;
    const item=deck[currentIndex];
    try{
      const state=await submitRestaurantVote(roomId,sessionToken,version,deckId,item.id,vote);
      setMyVotes(state.myVotes||{});
      if(state.room.stage==='matched'){onMatched?.(item);await onRefresh();return;}
      const nextDeckId=state.room.restaurant_summary?.deckId;
      if(nextDeckId&&nextDeckId!==deckId){setShowRoundTwoToast(true);setIsLoadingDeck(true);}
      else if(vote==='LATER')setDeck(previous=>[...previous.slice(0,currentIndex),...previous.slice(currentIndex+1),item]);
      else setCurrentIndex(index=>index+1);
      await onRefresh();
    }catch(error){console.error('Failed to record authoritative vote',error);await onRefresh();
      if((error as {code?:string})?.code!=='PT409')setDeckError('DECK_UNAVAILABLE');}
  },[deckId,currentIndex,deck,roomId,sessionToken,version,onMatched,onRefresh]);

  const isDeckFinished=deck.length>0&&deck.every(item=>['YES','NO'].includes(myVotes[item.id]||''));
  return {deck,currentIndex,totalCards:deck.length,isDeckFinished,isLoadingDeck,deckError,recordVote,
    summary,myVotes,showRoundTwoToast,dismissRoundTwoToast:()=>setShowRoundTwoToast(false)};
}
