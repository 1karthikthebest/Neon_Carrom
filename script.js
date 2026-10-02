const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let S, W, H;
let pieces = [];
let striker;
let player = 1;
let scores = [0, 0];
let moving = false;
let aiming = false;
let aimX = 0, aimY = 0;
let particles = [];

const FRICTION = 0.985;
const MAX_POWER = 16;
const MIN_SPEED = 0.08;

function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);

    W = r.width * dpr;
    H = r.height * dpr;
    S = Math.min(W, H);

    canvas.width = W;
    canvas.height = H;

    draw();
}

window.addEventListener("resize", resize);

function board() {
    return {
        l: S * .075,
        r: S * .925,
        t: S * .075,
        b: S * .925
    };
}

function pockets() {
    const b = board();

    return [
        [b.l, b.t],
        [b.r, b.t],
        [b.l, b.b],
        [b.r, b.b]
    ];
}

function piece(x, y, type, color) {
    return {
        x, y,
        vx: 0,
        vy: 0,
        r: S * .028,
        type,
        color,
        alive: true
    };
}

function newGame() {
    pieces = [];
    particles = [];
    scores = [0, 0];
    player = 1;
    moving = false;

    const c = S * .5;

    pieces.push(
        piece(c, c, "queen", "#ff3b81")
    );

    const r1 = S * .075;

    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;

        pieces.push(
            piece(
                c + Math.cos(a) * r1,
                c + Math.sin(a) * r1,
                i % 2 ? "white" : "black",
                i % 2 ? "#f8fafc" : "#202334"
            )
        );
    }

    const r2 = S * .145;

    for (let i = 0; i < 12; i++) {
        const a = i * Math.PI * 2 / 12;

        pieces.push(
            piece(
                c + Math.cos(a) * r2,
                c + Math.sin(a) * r2,
                i % 2 ? "black" : "white",
                i % 2 ? "#202334" : "#f8fafc"
            )
        );
    }

    makeStriker();

    msg("PLAYER 1 — AIM & SHOOT");
}

function makeStriker() {
    striker = {
        x: S * .5,
        y: player === 1 ? S * .83 : S * .17,
        vx: 0,
        vy: 0,
        r: S * .035,
        alive: true
    };
}

function msg(text) {
    document.getElementById("message").textContent = text;
}

function scoreUpdate() {
    document.getElementById("score1").textContent = scores[0];
    document.getElementById("score2").textContent = scores[1];
}

function draw() {
    if (!S) return;

    drawBoard();

    pieces.forEach(drawPiece);

    drawStriker();

    drawParticles();

    scoreUpdate();
}

function drawBoard() {
    const b = board();

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#111329";
    ctx.fillRect(0, 0, W, H);

    const g = ctx.createLinearGradient(0, 0, S, S);

    g.addColorStop(0, "#f8c77d");
    g.addColorStop(.5, "#e9a85e");
    g.addColorStop(1, "#c77b3d");

    ctx.fillStyle = g;

    round(
        b.l,
        b.t,
        b.r - b.l,
        b.b - b.t,
        S * .025
    );

    const pad = S * .045;

    ctx.fillStyle = "#f5bd76";

    ctx.fillRect(
        b.l + pad,
        b.t + pad,
        b.r - b.l - pad * 2,
        b.b - b.t - pad * 2
    );

    ctx.strokeStyle = "#71391f";
    ctx.lineWidth = S * .008;

    ctx.strokeRect(
        b.l + pad,
        b.t + pad,
        b.r - b.l - pad * 2,
        b.b - b.t - pad * 2
    );

    ctx.beginPath();

    ctx.arc(
        S * .5,
        S * .5,
        S * .17,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#873f28";
    ctx.lineWidth = S * .005;
    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
        S * .5,
        S * .5,
        S * .055,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    const inset = S * .17;

    ctx.beginPath();

    ctx.moveTo(b.l + inset, b.t + inset);
    ctx.lineTo(b.r - inset, b.b - inset);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(b.r - inset, b.t + inset);
    ctx.lineTo(b.l + inset, b.b - inset);

    ctx.stroke();

    pockets().forEach(([x, y]) => {
        ctx.beginPath();

        ctx.arc(
            x,
            y,
            S * .047,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#080914";
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 18;

        ctx.fill();

        ctx.shadowBlur = 0;
    });

    const lineY =
        player === 1 ? S * .83 : S * .17;

    ctx.beginPath();

    ctx.moveTo(S * .22, lineY);
    ctx.lineTo(S * .78, lineY);

    ctx.strokeStyle = "#ffffff44";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function round(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
}

function drawPiece(p) {
    if (!p.alive) return;

    const g = ctx.createRadialGradient(
        p.x - p.r * .35,
        p.y - p.r * .35,
        1,
        p.x,
        p.y,
        p.r
    );

    g.addColorStop(0, "#fff");
    g.addColorStop(.25, p.color);
    g.addColorStop(1, "#111");

    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = g;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#ffffff66";
    ctx.stroke();

    if (p.type === "queen") {
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${p.r}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", p.x, p.y);
    }
}

function drawStriker() {
    if (!striker) return;

    const g = ctx.createRadialGradient(
        striker.x - striker.r * .3,
        striker.y - striker.r * .3,
        1,
        striker.x,
        striker.y,
        striker.r
    );

    g.addColorStop(0, "#fff");
    g.addColorStop(.3, "#67e8f9");
    g.addColorStop(1, "#2563eb");

    ctx.beginPath();

    ctx.arc(
        striker.x,
        striker.y,
        striker.r,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = g;
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 20;

    ctx.fill();

    ctx.shadowBlur = 0;

    if (aiming && !moving) {
        const dx = aimX - striker.x;
        const dy = aimY - striker.y;
        const d = Math.hypot(dx, dy);

        if (d > 5) {
            ctx.beginPath();

            ctx.moveTo(
                striker.x,
                striker.y
            );

            ctx.lineTo(
                striker.x + dx / d * S * .45,
                striker.y + dy / d * S * .45
            );

            ctx.setLineDash([8, 8]);
            ctx.strokeStyle = "#fff";
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

function hit(a, b) {
    if (!a.alive || !b.alive) return;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    const min = a.r + b.r;

    if (!d || d >= min) return;

    const nx = dx / d;
    const ny = dy / d;
    const overlap = min - d;

    a.x -= nx * overlap / 2;
    a.y -= ny * overlap / 2;

    b.x += nx * overlap / 2;
    b.y += ny * overlap / 2;

    const rvx = a.vx - b.vx;
    const rvy = a.vy - b.vy;

    const v = rvx * nx + rvy * ny;

    if (v > 0) return;

    const impulse = -v * .9;

    a.vx -= impulse * nx;
    a.vy -= impulse * ny;

    b.vx += impulse * nx;
    b.vy += impulse * ny;
}

function movePiece(p) {
    if (!p.alive) return;

    p.x += p.vx;
    p.y += p.vy;

    p.vx *= FRICTION;
    p.vy *= FRICTION;

    if (Math.hypot(p.vx, p.vy) < MIN_SPEED) {
        p.vx = 0;
        p.vy = 0;
    }

    if (checkPocket(p)) return;

    const b = board();
    const m = S * .065;

    if (p.x - p.r < b.l + m) {
        p.x = b.l + m + p.r;
        p.vx = Math.abs(p.vx) * .85;
    }

    if (p.x + p.r > b.r - m) {
        p.x = b.r - m - p.r;
        p.vx = -Math.abs(p.vx) * .85;
    }

    if (p.y - p.r < b.t + m) {
        p.y = b.t + m + p.r;
        p.vy = Math.abs(p.vy) * .85;
    }

    if (p.y + p.r > b.b - m) {
        p.y = b.b - m - p.r;
        p.vy = -Math.abs(p.vy) * .85;
    }
}

function checkPocket(p) {
    for (const [x, y] of pockets()) {
        if (
            Math.hypot(
                p.x - x,
                p.y - y
            ) < S * .06
        ) {
            pocket(p);
            return true;
        }
    }

    return false;
}

function pocket(p) {
    if (!p.alive) return;

    p.alive = false;

    burst(
        p.x,
        p.y,
        p.color
    );

    if (p.type === "queen") {
        scores[player - 1] += 3;
        msg("🔥 QUEEN! +3");
    } else {
        const points =
            p.type === "white" ? 1 : 2;

        scores[player - 1] += points;

        msg(
            "NICE SHOT! +" +
            points
        );
    }

    scoreUpdate();
}

function burst(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;

        particles.push({
            x,
            y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            size: Math.random() * 4 + 2,
            life: 1,
            color
        });
    }
}

function updateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= .96;
        p.vy *= .96;

        p.life -= .03;
    });

    particles =
        particles.filter(
            p => p.life > 0
        );
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function pointer(e) {
    const r = canvas.getBoundingClientRect();

    return {
        x: (e.clientX - r.left) * W / r.width,
        y: (e.clientY - r.top) * H / r.height
    };
}

canvas.addEventListener("pointerdown", e => {
    if (moving || !striker) return;

    const p = pointer(e);

    if (
        Math.hypot(
            p.x - striker.x,
            p.y - striker.y
        ) < striker.r * 2
    ) {
        aiming = true;
        aimX = p.x;
        aimY = p.y;

        canvas.setPointerCapture(
            e.pointerId
        );
    }
});

canvas.addEventListener("pointermove", e => {
    if (!aiming) return;

    const p = pointer(e);

    aimX = p.x;
    aimY = p.y;
});

canvas.addEventListener("pointerup", e => {
    if (!aiming) return;

    aiming = false;

    const dx = striker.x - aimX;
    const dy = striker.y - aimY;

    const d = Math.hypot(dx, dy);

    if (d < 10) return;

    const power = Math.min(
        d / S * MAX_POWER,
        MAX_POWER
    );

    striker.vx =
        dx / d * power;

    striker.vy =
        dy / d * power;

    moving = true;

    msg("SHOT!");

    try {
        canvas.releasePointerCapture(
            e.pointerId
        );
    } catch {}
});

function update() {
    let active = false;

    pieces.forEach(p => {
        movePiece(p);

        if (
            p.alive &&
            Math.hypot(p.vx, p.vy) > .05
        ) {
            active = true;
        }
    });

    for (let i = 0; i < pieces.length; i++) {
        for (let j = i + 1; j < pieces.length; j++) {
            hit(pieces[i], pieces[j]);
        }
    }

    if (striker) {
        movePiece(striker);

        pieces.forEach(p => {
            hit(striker, p);
        });

        if (
            Math.hypot(
                striker.vx,
                striker.vy
            ) > .05
        ) {
            active = true;
        }
    }

    updateParticles();

    if (moving && !active) {
        moving = false;

        player =
            player === 1 ? 2 : 1;

        makeStriker();

        msg(
            "PLAYER " +
            player +
            " — AIM & SHOOT"
        );
    }

    draw();

    requestAnimationFrame(update);
}

document
    .getElementById("newGame")
    .addEventListener(
        "click",
        newGame
    );

/* START */
resize();
newGame();
update();
