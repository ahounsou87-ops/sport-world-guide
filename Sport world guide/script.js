/* script.js - navigation, login (localStorage), performance table, small helpers */

/* NAV TOGGLE */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if(navToggle){
  navToggle.addEventListener('click',()=>{
    mainNav.classList.toggle('show');
  });
}

/* SIMPLE AUTH (signup/login using localStorage)
   - This is a frontend-only demo. For production, use a secure backend + hashing + HTTPS.
*/
const Auth = {
  signup(email, password, name){
    const users = JSON.parse(localStorage.getItem('su_users')||'[]');
    if(users.find(u=>u.email===email)) return {ok:false, msg:'Utilisateur déjà enregistré'};
    users.push({email, password, name});
    localStorage.setItem('su_users', JSON.stringify(users));
    return {ok:true};
  },
  login(email,password){
    const users = JSON.parse(localStorage.getItem('su_users')||'[]');
    const u = users.find(x=>x.email===email && x.password===password);
    if(u){
      sessionStorage.setItem('su_current', JSON.stringify(u));
      return {ok:true, user:u};
    }
    return {ok:false, msg:'Email ou mot de passe incorrect'};
  },
  logout(){
    sessionStorage.removeItem('su_current');
  },
  current(){
    return JSON.parse(sessionStorage.getItem('su_current')||'null');
  }
};

/* PERFORMANCE TABLE - simple CRUD saved in localStorage,
   used in performance page or embedded area.
*/
const Performance = {
  key:'su_performances',
  getAll(){ return JSON.parse(localStorage.getItem(this.key)||'[]'); },
  add(record){
    const arr=this.getAll();
    arr.push(record);
    localStorage.setItem(this.key,JSON.stringify(arr));
  },
  remove(index){
    const arr=this.getAll();
    arr.splice(index,1);
    localStorage.setItem(this.key,JSON.stringify(arr));
  }
};

/* Render helper: if there's a container with id 'perfTable', show table */
function renderPerformanceTable(){
  const el = document.getElementById('perfTable');
  if(!el) return;
  const data = Performance.getAll();
  let html = '<div class="performance-table"><table><thead><tr><th>Nom</th><th>Sport</th><th>Stats</th><th>Niveau</th><th>Actions</th></tr></thead><tbody>';
  data.forEach((r,i)=>{
    html += `<tr><td>${r.nom}</td><td>${r.sport}</td><td>${r.performance}</td><td>${r.niveau}</td><td><button data-i="${i}" class="btn-delete">Supprimer</button></td></tr>`;
  });
  html += '</tbody></table></div>';
  el.innerHTML = html;

  // attach delete handlers
  Array.from(el.querySelectorAll('.btn-delete')).forEach(b=>{
    b.addEventListener('click',()=>{
      Performance.remove(parseInt(b.dataset.i,10));
      renderPerformanceTable();
    });
  });
}

/* handle add performance form if exists */
function bindPerfForm(){
  const form = document.getElementById('perfForm');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nom = form.querySelector('[name="nom"]').value.trim();
    const sport = form.querySelector('[name="sport"]').value.trim();
    const performance = form.querySelector('[name="performance"]').value.trim();
    const niveau = form.querySelector('[name="niveau"]').value;
    if(!nom || !sport) return alert('Remplis nom et sport');
    Performance.add({nom,sport,performance,niveau});
    form.reset();
    renderPerformanceTable();
  });
}

/* Sport detail dynamic: if page has #nomSport element, the sports data is used */
const sportsData = {
  football: {
    nom:"Football",
    description:"Le football est un sport collectif joué par deux équipes de 11 joueurs...",
    equipement:"Ballon, crampons, protège-tibias",
    benefices:"Cardio, coordination, esprit d'équipe",
    conseils:"Échauffe-toi, travaille les passes et le contrôle de balle",
    video:"https://www.youtube.com/embed/COZsX39Epv8",
    image:"/mnt/data/91D63D09-3750-445F-9F79-2A97B631CA3E.jpeg"
  },
  basketball: {
    nom:"Basketball",
    description:"Sport collectif avec paniers, dribble et tirs.",
    equipement:"Ballon, chaussures adaptées",
    benefices:"Explosivité, cardio, coordination",
    conseils:"Travaille le dribble et le tir",
    video:"https://www.youtube.com/embed/xb4JZVr3U9w",
    image:"images/basket.jpg"
  },
  natation: {
    nom:"Natation",
    description:"Sport aquatique excellent pour tout le corps.",
    equipement:"Maillot, lunettes, bonnet",
    benefices:"Respiration, endurance, faible impact sur les articulations",
    conseils:"Commence par apprendre la flottaison et la respiration",
    video:"https://www.youtube.com/embed/bpOSxM0rNPM",
    image:"images/swim.jpg"
  }
};

/* Auto-run binds */
document.addEventListener('DOMContentLoaded', ()=>{
  renderPerformanceTable();
  bindPerfForm();

  // If on sport-detail page, fill content
  const nameEl = document.getElementById('nomSport');
  if(nameEl){
    const urlParams = new URLSearchParams(window.location.search);
    const sportKey = urlParams.get('sport') || 'football';
    const s = sportsData[sportKey] || null;
    if(s){
      document.getElementById('nomSport').textContent = s.nom;
      document.getElementById('description').textContent = s.description;
      document.getElementById('equipement').textContent = s.equipement;
      document.getElementById('benefices').textContent = s.benefices;
      document.getElementById('conseils').textContent = s.conseils;
      document.getElementById('video').src = s.video;
      const imgWrap = document.getElementById('sportImage');
      if(imgWrap) imgWrap.src = s.image;
    }
  }

  // If login page present, attach login/signup handlers
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  if(signupForm){
    signupForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const name = signupForm.querySelector('[name="name"]').value.trim();
      const email = signupForm.querySelector('[name="email"]').value.trim();
      const pwd = signupForm.querySelector('[name="password"]').value.trim();
      const res = Auth.signup(email,pwd,name);
      if(!res.ok) return alert(res.msg);
      alert('Inscription réussie. Tu peux te connecter.');
      signupForm.reset();
    });
  }

  if(loginForm){
    loginForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const email = loginForm.querySelector('[name="email"]').value.trim();
      const pwd = loginForm.querySelector('[name="password"]').value.trim();
      const res = Auth.login(email,pwd);
      if(!res.ok) return alert(res.msg);
      alert('Connexion réussie. Bonjour ' + res.user.name);
      window.location.href = 'index.html';
    });
  }
});
