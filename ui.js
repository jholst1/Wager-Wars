(function(){
/* UI primitives */
window.BG = window.BG || {};
BG.ui = BG.ui || {};
const { h } = BG.core;

function Btn({onClick,children,color="indigo",disabled,sm,full}) {
  return h("button",{
    className:`btn btn-${color}${sm?" btn-sm":""}${full?" btn-full":""}`,
    onClick,disabled
  },children);
}

function Card({children,className=""}) {
  return h("div",{className:`card ${className}`},children);
}

function Inp({value,onChange,placeholder,style}) {
  return h("input",{className:"inp",value,placeholder,style,onChange:e=>onChange(e.target.value)});
}

function Sel({value,onChange,options}) {
  return h("select",{className:"sel",value,onChange:e=>onChange(e.target.value)},
    options.map(o=>h("option",{key:o,value:o},o)));
}

BG.ui.Btn=Btn;
BG.ui.Card=Card;
BG.ui.Inp=Inp;
BG.ui.Sel=Sel;

})();
