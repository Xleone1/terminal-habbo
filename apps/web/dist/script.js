document.addEventListener('DOMContentLoaded', function(){
  const openLogin = document.getElementById('open-login');
  const openRegister = document.getElementById('open-register');
  const loginBox = document.getElementById('login-box');
  const closeLogin = document.getElementById('close-login');
  const surv = document.getElementById('surveillance-cursor');

  function showLogin(){ loginBox.style.opacity=1; loginBox.style.transform='translateY(0)'; loginBox.scrollIntoView({behavior:'smooth',block:'center'}) }
  function hideLogin(){ loginBox.style.opacity=1; loginBox.style.transform='translateY(0)'}

  openLogin?.addEventListener('click', ()=>{ showLogin() });
  openRegister?.addEventListener('click', ()=>{ document.getElementById('register-form').scrollIntoView({behavior:'smooth',block:'center'}) });
  closeLogin?.addEventListener('click', ()=>{ hideLogin() });

  // cursor
  document.addEventListener('mousemove', (e)=>{
    surv.style.left = e.clientX+'px';
    surv.style.top = e.clientY+'px';
    surv.style.opacity = 1;
  });
  document.addEventListener('mouseleave', ()=>{ surv.style.opacity = 0 });

  // fake handlers
  document.getElementById('register-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const btn = ev.target.querySelector('.btn.primary');
    btn.textContent = 'Sincronizando…';
    btn.disabled = true;
    setTimeout(()=>{ btn.textContent='Únete ahora'; btn.disabled=false; alert('Registro simulado — integrar API real'); }, 900);
  });
  document.getElementById('login-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const btn = ev.target.querySelector('.btn.primary');
    btn.textContent = 'Verificando…'; btn.disabled=true;
    setTimeout(()=>{ btn.textContent='Entrar'; btn.disabled=false; alert('Inicio simulado — integrar API real'); }, 900);
  });
});
