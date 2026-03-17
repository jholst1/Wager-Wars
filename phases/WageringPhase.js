(function(){
window.BG = window.BG || {};
BG.phases = BG.phases || {};
const { h, useState, useEffect, useRef, useCallback } = BG.core;
const { Btn, Card, Inp, Sel } = BG.ui;
const { VerifyPopup, GuessPopup, RulesPopup } = BG.popups;
const { SIPS, LIKELIHOOD_OPTIONS, ODDS_MAP, genCode, sipsToDrinks, computeOdds } = BG.consts;
const { saveRoom, subscribeRoom, loadRoom } = BG.fb;

function WageringPhase({room,myName,isHost,onRoomUpdate}) {
  const me=room.players.find(p=>p.name===myName);
  const myGroup=me?.group;
  const groupBets=(room.bets||[]).filter(b=>b.group===myGroup&&b.locked);
  const existing=(room.wagers||{})[myName]||{};
  const [wagers,setWagers]=useState(()=>{const w={};groupBets.forEach(b=>{w[b.id]=existing[b.id]??0;});return w;});
  const saved=Object.keys((room.wagers||{})[myName]||{}).length>=groupBets.length&&groupBets.length>0;
  const MAX_WAGER_TOTAL = (room.maxWagerTotal===undefined ? 14 : room.maxWagerTotal); // null => no limit
  const setW=(id,val)=>setWagers(w=>{
    const old=Number(w[id]||0);
    let v=Math.max(-SIPS,Math.min(SIPS,Number(val||0))); // per-bet cap still 14

    if(MAX_WAGER_TOTAL===null){
      return {...w,[id]:v};
    }

    const usedTotal=Object.values(w).reduce((s,x)=>s+Math.abs(Number(x||0)),0);
    const base=usedTotal-Math.abs(old);
    const remaining=Math.max(0,MAX_WAGER_TOTAL-base);

    const sign=v<0?-1:1;
    const mag=Math.min(Math.abs(v),remaining);
    v = mag===0 ? 0 : sign*mag;

    return {...w,[id]:v};
  });
  const saveWagers=async()=>{
    const u={...room,wagers:{...(room.wagers||{}),[myName]:wagers}};
    await saveRoom(room.code,u); onRoomUpdate(u);
  };
  const allWagered=room.players.every(p=>{
    const pb=(room.bets||[]).filter(b=>b.author===p.name&&b.locked);
    return pb.length===0||Object.keys((room.wagers||{})[p.name]||{}).length>=pb.length;
  });
  const startGame=async()=>{
  const timerEnd = Date.now() + (room.durationMs || room.timerMinutes*60*1000);
  const u={...room,phase:"live",timerEnd,activeBets:(room.bets||[]).filter(b=>b.locked).map(b=>b.id)};
    await saveRoom(room.code,u); onRoomUpdate(u);
  };

  return h("div",{className:"col"},
    h("h2",{className:"text-xl font-bold"},"Place Your Wagers"),
    h(Card,{className:"card-yellow"},
      h("p",{className:"font-semibold text-sm c-yellow"},"💡 Wager guide"),
      h("p",{className:"muted text-xs mt1"},"Positive = betting it WILL happen. Negative = shorting (betting it WON'T). 0 = sit it out."),
      h("p",{className:"muted text-xs mt1"}, (()=>{
        const cap=(room.maxWagerTotal===undefined?14:room.maxWagerTotal);
        if(cap===null) return "Max total wager: No limit · Remaining: ∞";
        const used=Object.values(wagers).reduce((s,x)=>s+Math.abs(Number(x||0)),0);
        const rem=Math.max(0,cap-used);
        return `Max total wager: ${cap} · Remaining: ${rem}`;
      })() )
    ),
    ...groupBets.map(b=>{
      const odds=(room.oddsMap||{})[b.id]??1, w=wagers[b.id]??0, isShort=w<0;
      return h(Card,{key:b.id,className:isShort?"card-orange":""},
        h("p",{className:"c-indigo font-semibold text-sm"},b.target),
        h("p",{className:"mb2"},b.text),
        h("p",{className:"c-yellow font-bold text-sm mb1"},`Odds: ${odds}x`),
        h("p",{className:`text-xs mb3 ${isShort?"c-orange":w===0?"muted":"c-green"}`},
          isShort?`📉 Shorting — if it doesn't happen, hand out ${Math.abs(w)} sips`
          :w===0?"No wager"
          :`📈 Long — hand out ${Math.round(w*odds)} sips`
        ),
        h("div",{className:"flex items-center gap3"},
          h(Btn,{onClick:()=>setW(b.id,w-1),color:"gray",sm:true,disabled:w<=-SIPS},"−"),
          h("span",{className:`wager-num ${isShort?"c-orange":w===0?"c-muted":"c-green"}`},w),
          h(Btn,{onClick:()=>setW(b.id,w+1),color:"gray",sm:true,disabled:w>=SIPS},"+")
        )
      );
    }),
    !saved&&h(Btn,{onClick:saveWagers,color:"green",full:true},"Save Wagers"),
    saved&&h("p",{className:"font-bold text-center c-green"},"✓ Wagers saved!"),
    h(Card,{},
      ...room.players.map(p=>{
        const pb=(room.bets||[]).filter(b=>b.author===p.name&&b.locked);
        const done=pb.length===0||Object.keys((room.wagers||{})[p.name]||{}).length>=pb.length;
        return h("div",{key:p.name,className:"flex items-center gap2 mb1"},
          h("span",{style:{color:done?"#34d399":"rgba(255,255,255,0.3)"}},done?"✓":"○"),
          h("span",{style:{color:done?"white":"rgba(255,255,255,0.4)"}},p.name)
        );
      })
    ),
    allWagered&&isHost&&h(Btn,{onClick:startGame,color:"red",full:true},"Start the Game! 🎉")
  );
}

BG.phases.WageringPhase = WageringPhase;

})();
