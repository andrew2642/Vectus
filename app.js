// Shared Interactive Components

(function() {
  // DOM ready handler
  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  // ===== Progress Bar Animation =====
  function animateProgressBars() {
    const bars = document.querySelectorAll('[data-progress]');
    bars.forEach(bar => {
      const target = parseFloat(bar.getAttribute('data-progress'));
      let current = 0;
      const interval = setInterval(() => {
        current += target / 30;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        bar.style.width = current + '%';
      }, 20);
    });
  }

  // ===== Circular Progress Animation =====
  function animateCircularProgress() {
    const circles = document.querySelectorAll('[data-circle-progress]');
    circles.forEach(circle => {
      const maxOffset = 2 * Math.PI * (parseFloat(circle.getAttribute('r') || '19'));
      const progress = parseFloat(circle.getAttribute('data-circle-progress'));
      const dashOffset = maxOffset * (1 - progress / 100);
      circle.setAttribute('stroke-dasharray', maxOffset.toFixed(2));
      circle.setAttribute('stroke-dashoffset', maxOffset.toFixed(2));
      setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 1s ease-out';
        circle.setAttribute('stroke-dashoffset', dashOffset.toFixed(2));
      }, 100);
    });
  }

  // ===== Mission Card Toggle =====
  function initMissionCards() {
    const cards = document.querySelectorAll('.mission-card');
    cards.forEach(card => {
      card.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        const status = this.getAttribute('data-status');
        const xp = this.getAttribute('data-xp');
        if (status === 'completed') {
          this.setAttribute('data-status', 'incomplete');
          this.classList.remove('completed');
        } else {
          this.setAttribute('data-status', 'completed');
          this.classList.add('completed');
          showToast('Mission completed! +' + xp + ' XP', this);
        }
      });
    });
  }

  // ===== Filter Buttons =====
  function initFilters() {
    const filterBtns = document.querySelectorAll('[data-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const category = this.getAttribute('data-filter');
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const cards = document.querySelectorAll('.mission-card');
        cards.forEach(card => {
          const xp = parseInt(card.getAttribute('data-xp') || '0', 10);
          const status = card.getAttribute('data-status');
          let show = true;
          if (category === 'high-xp' && xp < 30) show = false;
          if (category === 'incomplete' && status === 'completed') show = false;
          card.style.display = show ? 'block' : 'none';
        });
      });
    });
  }

  // ===== Domain Expansion/Collapse =====
  function initDomainAccordion() {
    const headers = document.querySelectorAll('[data-domain-toggle]');
    headers.forEach(header => {
      header.addEventListener('click', function(event) {
        if (event.target.closest('button')) return;
        const content = this.nextElementSibling;
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        if (content) {
          content.classList.toggle('hidden');
        }
      });
      header.addEventListener('keydown', function(event) {
        if (event.target.closest('button')) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          header.click();
        }
      });
    });
  }

  // ===== Level Up Skills =====
  function initLevelUp() {
    const levelBtns = document.querySelectorAll('[data-level-up]');
    levelBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const domain = this.getAttribute('data-level-up');
        const xpElement = document.querySelector('[data-domain="' + domain + '"] .domain-xp');
        if (xpElement) {
          const currentXp = parseInt(xpElement.textContent.replace(/[^\d]/g, '') || '0', 10);
          const newXp = currentXp + 100;
          xpElement.innerHTML = newXp + ' <span class="text-slate-400 font-normal text-xs">/ 2,000 XP</span>';
          showToast('+' + 100 + ' XP to ' + domain + '!', btn);
        }
      });
    });
  }

  // ===== Radar Node Tooltips =====
  function initRadarNodes() {
    const nodes = document.querySelectorAll('[data-node]');
    const showTooltip = (node) => {
      const info = node.getAttribute('data-node');
      let tooltip = node.querySelector('.radar-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'radar-tooltip';
        tooltip.textContent = info;
        node.appendChild(tooltip);
      }
      tooltip.classList.add('visible');
    };
    const hideTooltip = (node) => {
      const tooltip = node.querySelector('.radar-tooltip');
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
    };
    nodes.forEach(node => {
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'img');
      node.setAttribute('aria-label', node.getAttribute('data-node'));
      node.addEventListener('mouseenter', () => showTooltip(node));
      node.addEventListener('focus', () => showTooltip(node));
      node.addEventListener('click', (event) => {
        event.stopPropagation();
        if (node.dataset.tooltipPinned === 'true') {
          node.dataset.tooltipPinned = 'false';
          hideTooltip(node);
        } else {
          node.dataset.tooltipPinned = 'true';
          showTooltip(node);
        }
      });
      node.addEventListener('mouseleave', () => {
        if (node.dataset.tooltipPinned !== 'true') hideTooltip(node);
      });
      node.addEventListener('blur', () => {
        if (node.dataset.tooltipPinned !== 'true') hideTooltip(node);
      });
    });
  }

  // ===== Dark Mode Toggle =====
  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    const html = document.documentElement;
    const updateIcon = () => {
      const icon = toggle.querySelector('span');
      if (html.classList.contains('dark')) {
        icon.textContent = 'light_mode';
      } else {
        icon.textContent = 'dark_mode';
      }
    };
    toggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      try {
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
      } catch {
      }
      updateIcon();
      window.dispatchEvent(new CustomEvent('themechange', { detail: { dark: html.classList.contains('dark') } }));
    });
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('theme');
    } catch {
      savedTheme = null;
    }
    if (savedTheme === 'dark') {
      html.classList.add('dark');
    }
    updateIcon();
  }

  // ===== Toast Notifications =====
  function showToast(message, anchorEl) {
    let toast = document.getElementById('toast-container');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-container';
      toast.className = 'fixed bottom-24 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm justify-center px-3';
      document.body.appendChild(toast);
    }
    const toastEl = document.createElement('div');
    toastEl.className = 'px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 opacity-0 translate-y-4';
    toastEl.textContent = message;
    toast.appendChild(toastEl);
    setTimeout(() => {
      toastEl.classList.remove('opacity-0', 'translate-y-4');
      toastEl.classList.add('opacity-100', 'translate-y-0');
    }, 10);
    setTimeout(() => {
      toastEl.classList.add('opacity-0');
      setTimeout(() => { toastEl.remove(); }, 300);
    }, 2500);
  }

  // ===== Scroll Reveal =====
  function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
  }

  // ===== XP Counter Animation =====
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      const suffixNode = el.querySelector('span');
      const suffix = suffixNode ? suffixNode.outerHTML : '';
      const isPercent = el.textContent.includes('%');
      const suffixText = isPercent ? '%' : suffix;
      const formatValue = value => {
        const rounded = Math.round(value);
        return rounded >= 1000 ? rounded.toLocaleString('en-US') : String(rounded);
      };
      let current = 0;
      const interval = setInterval(() => {
        current += target / 40;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.innerHTML = formatValue(current) + suffixText;
      }, 25);
    });
  }

  // ===== Quick Check-in =====
  function initQuickCheckIn() {
    const btn = document.getElementById('quick-checkin-btn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      const original = this.innerHTML;
      this.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-pulse">check_circle</span> <span class="font-label-xp">LOGGED +25 XP</span>';
      this.classList.add('pointer-events-none', 'opacity-75');
      setTimeout(() => {
        this.innerHTML = '<span class="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span> <span class="font-label-xp">+25 XP</span>';
        setTimeout(() => {
          this.innerHTML = original;
          this.classList.remove('pointer-events-none', 'opacity-75');
        }, 1500);
      }, 1500);
    });
  }

  // ===== Calendar Heatmap Interactivity =====
  function initCalendarHeatmap() {
    const days = document.querySelectorAll('.heatmap-day');
    days.forEach(day => {
      day.addEventListener('click', function() {
        const dayLabel = this.getAttribute('data-day') || '';
        showToast(dayLabel || 'Day selected', this);
        days.forEach(d => d.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
  }

  // ===== Quiz Selection =====
  function initQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;
    const buttons = quizContainer.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        buttons.forEach(b => {
          b.classList.remove('selected');
          b.classList.add('opacity-80');
          const status = b.querySelector('.quiz-status');
          if (status) status.remove();
        });
        this.classList.remove('opacity-80');
        this.classList.add('selected', 'opacity-100');
        const badge = document.createElement('span');
        badge.className = 'quiz-status flex items-center gap-1 font-label-telemetry text-tertiary';
        badge.innerHTML = '<span class="material-symbols-outlined text-[16px]">check_circle</span> SELECTED';
        this.appendChild(badge);
      });
    });
  }

  function initCoachModes() {
    const buttons = document.querySelectorAll('[data-coach-mode]');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(item => {
          const isActive = item === button;
          item.setAttribute('aria-selected', String(isActive));
          item.classList.toggle('text-white', isActive);
          item.classList.toggle('bg-primary', isActive);
          item.classList.toggle('hover:bg-indigo-700', isActive);
          item.classList.toggle('dark:bg-indigo-500', isActive);
          item.classList.toggle('dark:hover:bg-indigo-400', isActive);
          item.classList.toggle('shadow-sm', isActive);
          item.classList.toggle('text-slate-500', !isActive);
          item.classList.toggle('dark:text-slate-400', !isActive);
          item.classList.toggle('bg-white', !isActive);
          item.classList.toggle('dark:bg-slate-900', !isActive);
          item.classList.toggle('border', !isActive);
          item.classList.toggle('border-slate-200', !isActive);
          item.classList.toggle('dark:border-slate-800', !isActive);
          item.classList.toggle('hover:text-on-surface', !isActive);
          item.classList.toggle('dark:hover:text-slate-100', !isActive);
        });
      });
    });
  }

  // ===== Initialize all =====
  ready(() => {
    animateProgressBars();
    animateCircularProgress();
    animateCounters();
    initMissionCards();
    initFilters();
    initDomainAccordion();
    initLevelUp();
    initRadarNodes();
    initCoachModes();
    initThemeToggle();
    initScrollReveal();
    initQuickCheckIn();
    initCalendarHeatmap();
    initQuiz();
  });

  // Expose globally for inline handlers
  window.showToast = showToast;
  window.selectQuiz = function(element) {
    const parent = element.parentElement;
    const buttons = parent.querySelectorAll('button');
    buttons.forEach(function(btn) {
      btn.classList.remove('selected');
      btn.classList.add('opacity-80');
      var statusSpan = btn.querySelector('.quiz-status');
      if (statusSpan) statusSpan.remove();
    });
    element.classList.remove('opacity-80');
    element.classList.add('selected', 'opacity-100');
    if (!element.querySelector('.quiz-status')) {
      var badge = document.createElement('span');
      badge.className = 'quiz-status flex items-center gap-1 font-label-telemetry text-tertiary';
      badge.innerHTML = '<span class="material-symbols-outlined text-[16px]">check_circle</span> SELECTED';
      element.appendChild(badge);
    }
  };
})();
