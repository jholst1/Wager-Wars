/* UI primitives */
window.BG = window.BG || {};
BG.ui = BG.ui || {};
const { h } = BG.core;

function Btn({onClick,children,color="indigo",disabled,sm,full}

function Card({children,className=""}

function Inp({value,onChange,placeholder,style}

function Sel({value,onChange,options}

BG.ui.Btn = Btn;
BG.ui.Card = Card;
BG.ui.Inp = Inp;
BG.ui.Sel = Sel;
