window.BG = window.BG || {};
BG.phases = BG.phases || {};
const { h, useState, useEffect, useRef, useCallback } = BG.core;
const { Btn, Card, Inp, Sel } = BG.ui;
const { VerifyPopup, GuessPopup, RulesPopup } = BG.popups;
const { SIPS, LIKELIHOOD_OPTIONS, ODDS_MAP, genCode, sipsToDrinks, computeOdds } = BG.consts;
const { saveRoom, subscribeRoom, loadRoom } = BG.fb;

function Lobby({room,myName,isHost,onRoomUpdate}) {
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard?.writeText(room.code);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const removePlayer=async name=>{
    if(!window.confirm(`Remove ${name}?`)) return;
    const u={...room,players:room.players.filter(p=>p.name!==name),bets:(room.bets||[]).filter(b=>b.author!==name)};
    await saveRoom(room.code,u); onRoomUpdate(u);
  };
  const startGame=async()=>{
    if(room.players.length<2){alert("Need at least 2 players.");return;}
    const sh=[...room.players].sort(()=>Math.random()-0.5);
    const half=Math.ceil(sh.length/2);
    const u={...room,phase:"betting",players:sh.map((p,i)=>({...p,group:i<half?"A":"B"}))};
    await saveRoom(room.code,u); onRoomUpdate(u);
  };
  return h("div",{className:"col"},
    h(Card,{className:"row-between"},
      h("div",{},
        h("span",{className:"label"},"Room Code"),
        h("p",{className:"code-text",style:{margin:0}},room.code)
      ),
      h(Btn,{onClick:copy,color:"gray",sm:true},copied?"Copied!":"Copy")
    ),
    h(Card,{},
      h("p",{className:"muted mb3"},`Players (${room.players.length})`),
      h("div",{className:"flex flex-col gap2"},
        ...room.players.map(p=>h("div",{key:p.id,className:"row-between"},
          h("div",{className:"flex items-center gap2"},
            h("span",{className:"dot-green"}),
            h("span",{},`${p.name}${p.name===room.hostName?" 👑":""}`)
          ),
          isHost&&p.name!==myName&&h(Btn,{onClick:()=>removePlayer(p.name),color:"rose",sm:true},"Remove")
        ))
      )
    ),
    h("p",{className:"muted text-center"},`Timer: ${room.timerMinutes} min · ${SIPS} sips = 1 drink`),
    isHost
      ? h(Btn,{onClick:startGame,color:"green",full:true},"Split Groups & Start Betting")
      : h("p",{className:"muted text-center pulse"},"Waiting for host to start…")
  );
}

BG.phases.Lobby = Lobby;
