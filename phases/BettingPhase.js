window.BG = window.BG || {};
BG.phases = BG.phases || {};
const { h, useState, useEffect, useRef, useCallback } = BG.core;
const { Btn, Card, Inp, Sel } = BG.ui;
const { VerifyPopup, GuessPopup, RulesPopup } = BG.popups;
const { SIPS, LIKELIHOOD_OPTIONS, ODDS_MAP, genCode, sipsToDrinks, computeOdds } = BG.consts;
const { saveRoom, subscribeRoom, loadRoom } = BG.fb;

function BettingPhase({room,myName,isHost,onRoomUpdate}) {
  const me=room.players.find(p=>p.name===myName);
  const myGroup=me?.group;
  const others=room.players.filter(p=>p.group!==myGroup);
  const myBets=(room.bets||[]).filter(b=>b.author===myName);
  const locked=myBets.some(b=>b.locked);
  const [betText,setBetText]=useState(""), [target,setTarget]=useState(others[0]?.name||"");

  const removePlayer=async name=>{
    if(!window.confirm(`Remove ${name}? Their bets will also be removed.`)) return;
    const u={...room,players:room.players.filter(p=>p.name!==name),bets:(room.bets||[]).filter(b=>b.author!==name)};
    await saveRoom(room.code,u); onRoomUpdate(u);
  };
  const addBet=async()=>{
    if(!betText.trim()||myBets.length>=5||locked) return;
    const nb={id:genCode(),author:myName,group:myGroup,target,text:betText.trim(),locked:false};
    const u={...room,bets:[...(room.bets||[]),nb]};
    await saveRoom(room.code,u); onRoomUpdate(u); setBetText("");
  };
  const removeBet=async id=>{
    const u={...room,bets:room.bets.filter(b=>b.id!==id)};
    await saveRoom(room.code,u); onRoomUpdate(u);
  };
  const lockBets=async()=>{
    if(myBets.length===0){alert("Add at least 1 bet first.");return;}
    const u={...room,bets:room.bets.map(b=>b.author===myName?{...b,locked:true}:b)};
    await saveRoom(room.code,u); onRoomUpdate(u);
  };
  const allLocked=room.players.every(p=>(room.bets||[]).some(b=>b.author===p.name&&b.locked));
  const startVoting=async()=>{const u={...room,phase:"voting"};await saveRoom(room.code,u);onRoomUpdate(u);};

  return h("div",{className:"col"},
    h("div",{className:"row-between"},
      h("h2",{className:"text-xl font-bold"},"Betting Phase"),
      h("span",{className:`badge ${myGroup==="A"?"badge-a":"badge-b"}`},myGroup==="A"?"🔵 Group A":"🔴 Group B")
    ),
    h(Card,{},
      h("p",{className:"muted text-sm mb1"},`Your group: ${room.players.filter(p=>p.group===myGroup).map(p=>p.name).join(", ")}`),
      h("p",{className:"muted text-sm"},`Other group: ${others.map(p=>p.name).join(", ")}`)
    ),
    !locked&&h(Card,{},
      h("p",{className:"font-semibold mb3"},`Write a bet (${myBets.length}/5)`),
      h("span",{className:"label"},"Bet about:"),
      h(Sel,{value:target,onChange:setTarget,options:others.map(p=>p.name)}),
      h("div",{className:"mt3"},h(Inp,{value:betText,onChange:setBetText,placeholder:`e.g. ${target} will spill their drink`})),
      h("div",{className:"flex gap2 mt3"},
        h(Btn,{onClick:addBet,color:"indigo",sm:true,disabled:myBets.length>=5||!betText.trim()},"Add Bet"),
        myBets.length>0&&h(Btn,{onClick:lockBets,color:"green",sm:true},"Lock In")
      )
    ),
    myBets.length>0&&h(Card,{},
      locked&&h("p",{className:"font-bold mb3 c-green"},"✓ Bets locked in!"),
      h("div",{className:"flex flex-col gap2"},
        ...myBets.map(b=>h("div",{key:b.id,className:"bet-row"},
          h("span",{},h("span",{className:"c-indigo font-semibold"},`${b.target}: `),b.text),
          !locked&&h("button",{onClick:()=>removeBet(b.id),className:"rm-btn shrink-0"},"✕")
        ))
      )
    ),
    h(Card,{},
      h("p",{className:"muted mb2"},"Player status:"),
      h("div",{className:"flex flex-col"},
        ...room.players.map(p=>{
          const pl=(room.bets||[]).some(b=>b.author===p.name&&b.locked);
          return h("div",{key:p.name,className:"status-row"},
            h("div",{className:"flex items-center gap2"},
              h("span",{style:{color:pl?"#34d399":"rgba(255,255,255,0.3)"}},pl?"✓":"○"),
              h("span",{style:{color:pl?"white":"rgba(255,255,255,0.4)"}},p.name)
            ),
            isHost&&p.name!==myName&&h(Btn,{onClick:()=>removePlayer(p.name),color:"rose",sm:true},"Remove")
          );
        })
      )
    ),
    allLocked&&isHost&&h(Btn,{onClick:startVoting,color:"yellow",full:true},"Everyone's In — Start Voting")
  );
}

BG.phases.BettingPhase = BettingPhase;
