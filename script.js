(function(){
'use strict';
var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine = matchMedia('(pointer: fine)').matches;

// scroll reveal
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

// hero stack tilt (index.html only)
var tilt = document.getElementById('tilt');
if (tilt && !reduced && fine) {
  var scene = document.querySelector('.scene');
  scene.addEventListener('mousemove', function(e){
    var r = scene.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.transform = 'rotateY(' + (-12 + x * 14) + 'deg) rotateX(' + (7 - y * 10) + 'deg)';
  });
  scene.addEventListener('mouseleave', function(){ tilt.style.transform = 'rotateY(-12deg) rotateX(7deg)'; });
}

// pointer-tracked tilt + spotlight glow on every card
if (!reduced) {
  var cards = document.querySelectorAll('.hcard, .price-card, .door');
  cards.forEach(function(card){
    if (fine) {
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        var rx = (py - .5) * -8, ry = (px - .5) * 8;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.transform = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transform = '';
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    }
    // touch feedback: brief press pulse
    card.addEventListener('touchstart', function(){
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '30%');
      card.classList.add('tapped');
    }, { passive: true });
    card.addEventListener('touchend', function(){
      setTimeout(function(){ card.classList.remove('tapped'); }, 260);
    }, { passive: true });
  });
}
})();
