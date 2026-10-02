const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W, H, S;

let pieces = [];
let striker;

let currentPlayer = 1;
let score = [0, 0];

let queenOnBoard = true;

let shooting = false;
let moving = false;

let aimX = 0;
let aimY = 0;

let particles = [];

const FRICTION = 0.985;
const MIN_SPEED = 0.08;
const MAX_POWER = 17;
const PIECE_RADIUS = 0.028;