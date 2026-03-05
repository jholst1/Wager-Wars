/* Popups */
window.BG = window.BG || {};
BG.popups = BG.popups || {};
const { h, useState } = BG.core;
const { Card, Btn } = BG.ui;

function VerifyPopup({bet,room,myName,onClose}

function GuessPopup({result, myName, onClose}

function RulesPopup({onClose}

BG.popups.VerifyPopup = VerifyPopup;
BG.popups.GuessPopup = GuessPopup;
BG.popups.RulesPopup = RulesPopup;
