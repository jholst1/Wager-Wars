/* Core + namespace */
window.BG = window.BG || {};
BG.core = BG.core || {};
BG.core.h = React.createElement;
BG.core.React = React;
BG.core.useState = React.useState;
BG.core.useEffect = React.useEffect;
BG.core.useRef = React.useRef;
BG.core.useCallback = React.useCallback;

BG.APP_BUILD = BG.APP_BUILD || "v7-modular";
console.log("Bet Game build", BG.APP_BUILD);
