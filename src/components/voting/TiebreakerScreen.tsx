import React,{useMemo,useState}from'react';
import{useRoom}from'../../context/RoomContext';import{useLocale}from'../../context/LocaleContext';
import{Header}from'../common/Header';import{TactileButton}from'../common/TactileButton';
import{ArcadeWheel,type ArcadeWheelSlice}from'../common/ArcadeWheel';
import{getCategoryById,NEO_BRUTALIST_PALETTE}from'../../lib/consensus';

export const TiebreakerScreen:React.FC=()=>{
  const{currentRoom,isHost,resolveConsensus,participants}=useRoom(),{t,locale}=useLocale(),[isSubmitting,setIsSubmitting]=useState(false);
  const contenders=useMemo(()=>(currentRoom?.tied_categories||[]).map(getCategoryById).filter(Boolean),[currentRoom?.tied_categories]);
  const slices=useMemo<ArcadeWheelSlice[]>(()=>contenders.map((category,index)=>({
    id:category!.id,name:locale==='ar'?category!.ar:category!.en,emoji:category!.icon,votes:1,
    color:NEO_BRUTALIST_PALETTE[index%NEO_BRUTALIST_PALETTE.length],startAngle:index*360/contenders.length,
    endAngle:(index+1)*360/contenders.length,midAngle:(index+.5)*360/contenders.length,angle:360/contenders.length,
  })),[contenders,locale]);
  if(!currentRoom)return null;
  const choose=async()=>{if(!isHost||isSubmitting)return;setIsSubmitting(true);try{await resolveConsensus('','random_picked');}catch(error){console.error('Error resolving category tie',error);setIsSubmitting(false);}};
  return <div className="relative flex min-h-[92dvh] w-full flex-col justify-between px-4 pb-8">
    <div><Header showBack={false} showMenu={false} participantCount={participants.length} showCount/>
      <div className="mb-3 mt-2 text-center"><h2 className="font-alexandria text-2xl font-extrabold text-brand-ink">{t('categoryRoulette.title')}</h2>
        <p className="text-sm font-medium text-brand-gray">{t('categoryRoulette.subtitle')}</p></div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">{contenders.map(category=><span key={category!.id} className="rounded-full border-2 border-brand-ink bg-white px-3 py-1 text-xs font-black">{category!.icon} {locale==='ar'?category!.ar:category!.en}</span>)}</div>
      <div className="flex justify-center"><ArcadeWheel slices={slices} rotation={0} isSpinning={false}/></div>
    </div>
    <div className="mx-auto w-full max-w-md">{isHost?<TactileButton onClick={choose} disabled={isSubmitting||slices.length<2} isLoading={isSubmitting} variant="yellow" fullWidth size="lg" icon="🎯">{t('categoryRoulette.spinBtn')}</TactileButton>
      :<div className="rounded-2xl border-2 border-brand-ink/20 bg-white p-3 text-center text-xs font-black text-brand-gray">{t('categoryRoulette.waitingHost')}</div>}</div>
  </div>;
};
