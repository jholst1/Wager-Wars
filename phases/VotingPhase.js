window.BG = window.BG || {};
BG.phases = BG.phases || {};
const { h, useState, useEffect, useRef, useCallback } = BG.core;
const { Btn, Card, Inp, Sel } = BG.ui;
const { VerifyPopup, GuessPopup, RulesPopup } = BG.popups;
const { SIPS, LIKELIHOOD_OPTIONS, ODDS_MAP, genCode, sipsToDrinks, computeOdds } = BG.consts;
const { saveRoom, subscribeRoom, loadRoom } = BG.fb;

function VotingPhase({room,myName,isHost,onRoomUpdate}) {
  const me=room.players.find(p=>p.name===myName);
  const myGroup=me?.group;
  const myGroupBets=(room.bets||[]).filter(b=>b.group===myGroup&&b.locked);
  const myVotes=(room.votes||{})[myName]||{};

  const vote=async(betId,l)=>{
    const u={...room,votes:{...(room.votes||{}),[myName]:{...myVotes,[betId]:l}}};
    await saveRoom(room.code,u); onRoomUpdate(u);
  };
  const everyoneVoted=room.players.every(p=>{
    const gb=(room.bets||[]).filter(b=>b.group===p.group&&b.locked);
    return gb.every(b=>((room.votes||{})[p.name]||{})[b.id]);
  });
  const startWagering=async()=>{
    const oddsMap={};
    (room.bets||[]).filter(b=>b.locked).forEach(b=>{oddsMap[b.id]=computeOdds(b.id,room.bets,room.votes||{},room.players);});
    const u={...room,phase:"wagering",oddsMap}; await saveRoom(room.code,u); onRoomUpdate(u);
  };

  return h("div",{className:"col"},
    h("h2",{className:"text-xl font-bold"},"Vote on Your Bets"),
    h("p",{className:"muted"},"Rate how likely each of your group's bets are. This sets the odds."),
    myGroupBets.length===0&&h("p",{className:"muted italic"},"No bets to vote on."),
    ...myGroupBets.map(b=>h(Card,{key:b.id},
      h("p",{className:"c-indigo font-semibold text-sm mb1"},b.target),
      h("p",{className:"mb3"},b.text),
      h("span",{className:"label"},"How likely?"),
      h("div",{className:"flex flex-wrap gap2 mt1"},
        ...LIKELIHOOD_OPTIONS.map(l=>h("button",{
          key:l, onClick:()=>vote(b.id,l),
          className:`pill${myVotes[b.id]===l?" pill-active":""}`
        },l))
      )
    )),
    h(Card,{},
      h("p",{className:"muted mb2"},"Waiting for votes…"),
      ...room.players.map(p=>{
        const gb=(room.bets||[]).filter(b=>b.group===p.group&&b.locked);
        const done=gb.every(b=>((room.votes||{})[p.name]||{})[b.id]);
        return h("div",{key:p.name,className:"flex items-center gap2 mb1"},
          h("span",{style:{color:done?"#34d399":"rgba(255,255,255,0.3)"}},done?"✓":"○"),
          h("span",{style:{color:done?"white":"rgba(255,255,255,0.4)"}},p.name)
        );
      })
    ),
    everyoneVoted&&isHost&&h(Btn,{onClick:startWagering,color:"yellow",full:true},"All Votes In — Set Wagers")
  );
}

BG.phases.VotingPhase = VotingPhase;
