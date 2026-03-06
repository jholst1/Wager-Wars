(function(){
window.BG = window.BG || {};
BG.phases = BG.phases || {};
const { h, useState, useEffect, useRef, useCallback } = BG.core;
const { Btn, Card, Inp, Sel } = BG.ui;
const { VerifyPopup, GuessPopup, RulesPopup } = BG.popups;
const { SIPS, LIKELIHOOD_OPTIONS, ODDS_MAP, genCode, sipsToDrinks, computeOdds } = BG.consts;
const { saveRoom, subscribeRoom, loadRoom } = BG.fb;

function Landing({onHost,onJoin}) {
  const [code,setCode]=useState("");
  const [showRules,setShowRules]=useState(false);
  return h("div",{className:"col-center"},
    showRules&&h(RulesPopup,{onClose:()=>setShowRules(false)}),
    h("div",{className:"text-5xl"},"🍺"),
    h("h1",{className:"font-black",style:{fontSize:"2.2rem",letterSpacing:"-0.02em",margin:"0"}},"The Bet Game"),
    h("p",{className:"muted",style:{maxWidth:"18rem"}},"A party drinking game where you bet on what the other team will do."),
    h("div",{className:"flex flex-col gap3 w-full",style:{maxWidth:"20rem"}},
      h(Btn,{onClick:onHost,color:"indigo",full:true},"Host a Game"),
      h("div",{className:"flex gap2"},
        h(Inp,{value:code,onChange:v=>setCode(v.toUpperCase()),placeholder:"Room code"}),
        h(Btn,{onClick:()=>onJoin(code),color:"gray",sm:true},"Join")
      ),
      h(Btn,{onClick:()=>setShowRules(true),color:"gray",full:true},"Rules")
    )
  );
}

BG.phases.Landing = Landing;

})();
