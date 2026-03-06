(function(){
window.BG = window.BG || {};
BG.phases = BG.phases || {};
const { h, useState, useEffect, useRef, useCallback } = BG.core;
const { Btn, Card, Inp, Sel } = BG.ui;
const { VerifyPopup, GuessPopup, RulesPopup } = BG.popups;
const { SIPS, LIKELIHOOD_OPTIONS, ODDS_MAP, genCode, sipsToDrinks, computeOdds } = BG.consts;
const { saveRoom, subscribeRoom, loadRoom } = BG.fb;

function HostSetup({onStart}) {
  const [name,setName]=useState(""), [minutes,setMinutes]=useState(20);
  const [maxTotal,setMaxTotal]=useState("14");
  const [noLimit,setNoLimit]=useState(false);
  const code=useRef(genCode()).current;
  const start=async()=>{
    if(!name.trim()) return;
    const room={code,phase:"lobby",hostName:name.trim(),timerMinutes:minutes,
      maxWagerTotal:(noLimit?null: (parseInt(maxTotal||"14",10)||14)),
      players:[{name:name.trim(),group:null,id:genCode()}],
      bets:[],votes:{},wagers:{},oddsMap:{},verifiedBets:[],expiredBets:[],
      drinkTotals:{},giveTotals:{},timerEnd:null,guessLog:[],activeBets:[],
      lastGuessResult:null,lastVerifiedBet:null,shortWins:[]};
    await saveRoom(code,room); onStart(room,name.trim());
  };
  return h("div",{className:"col"},
    h("h2",{className:"text-2xl font-bold"},"Host Setup"),
    h(Card,{},
      h("span",{className:"label"},"Your name"),
      h(Inp,{value:name,onChange:setName,placeholder:"Enter your name"})
    ),
    h(Card,{},
      h("span",{className:"label"},"Timer (minutes)"),
      h("div",{className:"flex items-center gap4"},
        h(Btn,{onClick:()=>setMinutes(m=>Math.max(5,m-5)),color:"gray",sm:true},"−"),
        h("span",{className:"font-black text-3xl",style:{width:"3rem",textAlign:"center"}},minutes),
        h(Btn,{onClick:()=>setMinutes(m=>m+5),color:"gray",sm:true},"+")
      )

    ),
    h(Card,{},
      h("span",{className:"label"},"Max total wager per player (sum of abs wagers)"),
      h("div",{className:"flex items-center gap3"},
        h(Btn,{onClick:()=>setNoLimit(v=>!v),color:noLimit?"green":"gray",sm:true},noLimit?"No limit":"Set limit"),
        !noLimit && h(Inp,{value:maxTotal,onChange:setMaxTotal,placeholder:"14",style:{maxWidth:"6rem"}}),
        !noLimit && h("span",{className:"muted text-sm"},"sips")
      ),
      h("p",{className:"muted text-xs mt2"},"Counts both longs and shorts using absolute value. Per-bet max is still 14.")
    ),
    h(Btn,{onClick:start,color:"green",full:true},"Create Room")
  );
}

BG.phases.HostSetup = HostSetup;

})();
