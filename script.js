// --- CONSTANTS & DATA ---
const teamNames = {"mx":"Mexico","za":"S. Africa","kr":"S. Korea","cz":"Czechia","ca":"Canada","ba":"Bosnia","qa":"Qatar","ch":"Swiss","br":"Brazil","ma":"Morocco","ht":"Haiti","gb-sct":"Scotland","us":"USA","py":"Paraguay","au":"Australia","tr":"Turkey","de":"Germany","cw":"Curacao","ci":"Ivory Coast","ec":"Ecuador","nl":"Netherl.","jp":"Japan","se":"Sweden","tn":"Tunisia","be":"Belgium","eg":"Egypt","ir":"Iran","nz":"N. Zealand","es":"Spain","cv":"C. Verde","sa":"S. Arabia","uy":"Uruguay","fr":"France","sn":"Senegal","iq":"Iraq","no":"Norway","ar":"Argentina","dz":"Algeria","at":"Austria","jo":"Jordan","pt":"Portugal","cd":"DR Congo","uz":"Uzbekistan","co":"Colombia","gb-eng":"England","hr":"Croatia","gh":"Ghana","pa":"Panama"};
const teams = {"A":["mx","za","kr","cz"],"B":["ca","ba","qa","ch"],"C":["br","ma","ht","gb-sct"],"D":["us","py","au","tr"],"E":["de","cw","ci","ec"],"F":["nl","jp","se","tn"],"G":["be","eg","ir","nz"],"H":["es","cv","sa","uy"],"I":["fr","sn","iq","no"],"J":["ar","dz","at","jo"],"K":["pt","cd","uz","co"],"L":["gb-eng","hr","gh","pa"]};
let selectedWCs = []; 
let standings = {}; 
let matchStore = {};

const matchLayout = {73:1,74:1,75:1,76:1,77:1,78:1,79:1,80:1,81:8,82:8,83:8,84:8,85:8,86:8,87:8,88:8,89:2,90:2,91:2,92:2,93:7,94:7,95:7,96:7,97:3,98:3,99:6,100:6,101:4,102:5,103:'center',104:'center'};

// --- INITIALIZATION ---
window.onload = () => displayReviews();

function showReviews() {
    document.getElementById('home-page').classList.add('hidden-section');
    document.getElementById('review-page').classList.remove('hidden-section');
    displayReviews();
}

// --- REVIEWS SYSTEM ---
function submitReview() {
    const name = document.getElementById('rev-name').value.trim();
    const text = document.getElementById('rev-text').value.trim();
    if(!name || !text) return alert("Please fill both fields");
    
    const savedReviews = JSON.parse(localStorage.getItem('wc_reviews') || "[]");
    const newReview = { name, text, date: new Date().toLocaleDateString() };
    savedReviews.unshift(newReview);
    
    localStorage.setItem('wc_reviews', JSON.stringify(savedReviews));
    document.getElementById('rev-name').value = "";
    document.getElementById('rev-text').value = "";
    displayReviews();
}

function displayReviews() {
    const feed = document.getElementById('review-feed');
    const savedReviews = JSON.parse(localStorage.getItem('wc_reviews') || "[]");
    let html = `
        <div class="bg-white/5 p-6 rounded-xl border-l-4 border-blue-500">
            <p class="italic text-gray-200 mb-2">"This predictor is fire! Finally a way to track the new 48-team format."</p>
            <p class="text-xs font-black uppercase text-blue-500">— Predictor Bot (Featured)</p>
        </div>
    `;
    savedReviews.forEach(rev => {
        html += `
            <div class="bg-white/5 p-6 rounded-xl border-l-4 border-red-500">
                <p class="italic text-gray-200 mb-2">"${rev.text}"</p>
                <div class="flex justify-between items-center">
                    <p class="text-xs font-black uppercase text-red-500">— ${rev.name}</p>
                    <span class="text-[10px] opacity-30">${rev.date}</span>
                </div>
            </div>
        `;
    });
    feed.innerHTML = html;
}

// --- PREDICTION LOGIC ---
function startPredicting() {
    document.getElementById('home-page').classList.add('hidden-section');
    document.getElementById('prediction-engine').classList.remove('hidden-section');
    initGroups();
}

function initGroups() {
    const grid = document.getElementById('groups-grid');
    grid.innerHTML = "";
    Object.keys(teams).forEach(g => {
        const div = document.createElement('div');
        div.className = "bg-white/5 border border-white/10 rounded-xl p-3";
        div.innerHTML = `<div class="pb-2 mb-2 border-b border-white/10 font-bold text-red-500">GROUP ${g}</div><ul id="list-${g}" class="space-y-1">${teams[g].map((id, i) => `<li class="flex items-center bg-white/5 p-2 rounded cursor-move ${i<2?'qualifier-border':''}" data-id="${id}"><span class="w-4 text-[10px] font-bold">${i+1}</span><img src="https://flagcdn.com/w40/${id}.png" crossorigin="anonymous" class="flag mx-2"> ${teamNames[id]}</li>`).join('')}</ul>`;
        grid.appendChild(div);
        new Sortable(document.getElementById(`list-${g}`), { animation:150, onEnd: (e) => {
            e.to.querySelectorAll('li').forEach((li, idx) => { li.querySelector('span').innerText = idx+1; li.className = `flex items-center bg-white/5 p-2 rounded cursor-move ${idx<2?'qualifier-border':''}`; });
        }});
    });
}

function lockGroups() {
    Object.keys(teams).forEach(g => { standings[g] = Array.from(document.getElementById(`list-${g}`).querySelectorAll('li')).map(li => ({ id: li.dataset.id, name: teamNames[li.dataset.id] })); });
    document.getElementById('group-section').classList.add('hidden-section');
    document.getElementById('wildcard-section').classList.remove('hidden-section');
    const wcCont = document.getElementById('third-place-container');
    wcCont.innerHTML = ""; 

    Object.keys(standings).forEach(g => {
        const team = standings[g][2];
        const card = document.createElement('div');
        card.className = "wildcard-card bg-white/10 p-4 rounded-xl cursor-pointer border border-white/10 hover:bg-white/20";
        card.innerHTML = `<img src="https://flagcdn.com/w80/${team.id}.png" crossorigin="anonymous" class="mx-auto mb-2 h-10"><p class="font-bold text-sm">${team.name}</p>`;
        card.onclick = () => {
            if(selectedWCs.includes(team)) {
                selectedWCs = selectedWCs.filter(t => t !== team);
                card.classList.remove('bg-red-600', 'border-white', 'shadow-[0_0_15px_rgba(239,68,68,0.5)]');
                card.classList.add('bg-white/10', 'border-white/10');
            } else if(selectedWCs.length < 8) {
                selectedWCs.push(team);
                card.classList.remove('bg-white/10', 'border-white/10');
                card.classList.add('bg-red-600', 'border-white', 'shadow-[0_0_15px_rgba(239,68,68,0.5)]');
            }
            document.getElementById('wc-counter').innerText = `${selectedWCs.length} / 8 SELECTED`;
            document.getElementById('launch-btn').disabled = selectedWCs.length < 8;
            document.getElementById('launch-btn').classList.toggle('opacity-50', selectedWCs.length < 8);
        };
        wcCont.appendChild(card);
    });
}

function initBracket() {
    document.getElementById('setup-container').classList.add('hidden-section');
    document.getElementById('knockout-section').style.display = 'block';
    document.getElementById('screenshot-btn').classList.remove('hidden');
    Object.keys(matchLayout).forEach(mid => {
        const h = document.getElementById(`h-${mid}`) || document.createElement('div');
        h.id = `h-${mid}`; h.className = "mb-4";
        if(matchLayout[mid] !== 'center') document.getElementById(`col-${matchLayout[mid]}`).appendChild(h);
        matchStore[mid] = { teams: [null, null], winner: null };
        renderMatch(mid);
    });
    const r32 = [[73,standings.A[1],standings.B[1]],[75,standings.F[0],standings.C[1]],[74,standings.E[0],selectedWCs[0]],[77,standings.I[0],selectedWCs[1]],[76,standings.C[0],standings.F[1]],[78,standings.E[1],standings.I[1]],[79,standings.A[0],selectedWCs[2]],[80,standings.L[0],selectedWCs[3]],[83,standings.K[1],standings.L[1]],[84,standings.H[0],standings.J[1]],[81,standings.D[0],selectedWCs[4]],[82,standings.G[0],selectedWCs[5]],[86,standings.J[0],standings.H[1]],[88,standings.D[1],standings.G[1]],[85,standings.B[0],selectedWCs[6]],[87,standings.K[0],selectedWCs[7]]];
    r32.forEach(d => { matchStore[d[0]].teams = [d[1], d[2]]; renderMatch(d[0]); });
}

function renderMatch(mid) {
    const h = document.getElementById(`h-${mid}`); const d = matchStore[mid];
    h.innerHTML = `<div class="match-box"><div class="text-[8px] opacity-20 p-1">MATCH ${mid}</div>${d.teams.map((t, i) => `<div class="team-row ${d.winner?.id === t?.id && t ? 'winner-active' : ''}" onclick="advance(${mid}, ${i})">${t ? `<img src="https://flagcdn.com/w40/${t.id}.png" crossorigin="anonymous" class="flag"> ${t.name}` : '<span class="opacity-20 italic">TBD</span>'}</div>`).join('')}</div>`;
}

function advance(mid, idx) {
    const team = matchStore[mid].teams[idx]; if(!team) return;
    matchStore[mid].winner = team; renderMatch(mid);
    const logic = {73:[89,0],75:[89,1],74:[90,0],77:[90,1],76:[91,0],78:[91,1],79:[92,0],80:[92,1],83:[93,0],84:[93,1],81:[94,0],82:[94,1],86:[95,0],88:[95,1],85:[96,0],87:[96,1],89:[97,0],90:[97,1],91:[98,0],92:[98,1],93:[99,0],94:[99,1],95:[100,0],96:[100,1],97:[101,0],98:[101,1],99:[102,0],100:[102,1],101:[104,0,103],102:[104,1,103]};
    const rule = logic[mid];
    if(!rule) { if(mid==104){document.getElementById('champion-reveal').classList.remove('hidden'); document.getElementById('winner-name').innerText = team.name;} return; }
    matchStore[rule[0]].teams[rule[1]] = team; renderMatch(rule[0]);
    if(rule[2]) { const loser = matchStore[mid].teams[idx === 0 ? 1 : 0]; matchStore[rule[2]].teams[rule[1]] = loser; renderMatch(rule[2]); }
}

async function takeScreenshot() {
    const area = document.getElementById('capture-area');
    const title = document.getElementById('main-bracket-title');
    title.classList.add('snapshot-heading');
    html2canvas(area, { backgroundColor: '#0a0f1e', scale: 2, useCORS: true }).then(canvas => {
        title.classList.remove('snapshot-heading');
        const link = document.createElement('a'); link.download = 'wc2026-bracket.png';
        link.href = canvas.toDataURL(); link.click();
    });
}