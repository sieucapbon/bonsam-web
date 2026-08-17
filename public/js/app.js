/* ==========================================================================
   Quản Lý Phần Thưởng Bon Sam - Client App Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  let state = {
    profiles: [],
    activeProfileId: '',
    isParentUnlocked: false,
    pinMode: 'global', // 'global' or 'per_profile'
    globalPinCode: '1234',
    masterPinCode: '9999',
    pinCode: '1234'
  };

  const CURRENT_YEAR = new Date().getFullYear();

  // Avatar Presets
  const AVATARS_BOY = ['🏎️', '🤖', '🦖', '🚀', '⚽', '🦸', '🚜', '🚁', '🏆', '🎮'];
  const AVATARS_GIRL = ['👑', '🦄', '🐱', '🎀', '🧜‍♀️', '🎨', '🌸', '🧸', '💖', '🩰'];

  // DOM Elements
  const body = document.body;
  const profilesList = document.getElementById('profiles-list');
  const addProfileBtn = document.getElementById('add-profile-btn');
  const parentLockBtn = document.getElementById('parent-lock-btn');
  const lockStatusIcon = document.getElementById('lock-status-icon');

  // Hero Card Elements
  const currentAvatar = document.getElementById('current-avatar');
  const currentGenderTag = document.getElementById('current-gender-tag');
  const currentName = document.getElementById('current-name');
  const currentAge = document.getElementById('current-age');
  const currentBirthyear = document.getElementById('current-birthyear');
  const balanceAmount = document.getElementById('balance-amount');
  const balanceSubtext = document.getElementById('balance-subtext');
  const statTotalReward = document.getElementById('stat-total-reward');
  const statTotalFine = document.getElementById('stat-total-fine');

  // Nav & Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // Action Grids
  const rewardsGrid = document.getElementById('rewards-grid');
  const finesGrid = document.getElementById('fines-grid');
  const wishlistItems = document.getElementById('wishlist-items');
  const historyList = document.getElementById('history-list');

  // Settings & Management
  const editCurrentProfileBtn = document.getElementById('edit-current-profile-btn');
  const manageRewardsList = document.getElementById('manage-rewards-list');
  const manageFinesList = document.getElementById('manage-fines-list');
  const manageProfilesList = document.getElementById('manage-profiles-list');
  const btnAddProfileSettings = document.getElementById('btn-add-profile-settings');
  const parentModeStatus = document.getElementById('parent-mode-status');
  const toggleParentModeBtn = document.getElementById('toggle-parent-mode-btn');

  // Modals & Forms
  const profileModal = document.getElementById('profile-modal');
  const profileForm = document.getElementById('profile-form');
  const profileNameInput = document.getElementById('profile-name');
  const profileBirthyearSelect = document.getElementById('profile-birthyear');
  const calculatedAgePreview = document.getElementById('calculated-age-preview');
  const avatarPicker = document.getElementById('avatar-picker');
  const deleteProfileModalBtn = document.getElementById('delete-profile-modal-btn');
  const perProfilePinGroup = document.getElementById('per-profile-pin-group');
  const profilePinInput = document.getElementById('profile-pin-input');
  const pinModeRadios = document.querySelectorAll('input[name="pin-mode-setting"]');

  // Forgot / Reset PIN elements
  const forgotPinBtn = document.getElementById('forgot-pin-btn');
  const resetPinModal = document.getElementById('reset-pin-modal');
  const resetPinForm = document.getElementById('reset-pin-form');
  const masterPinInput = document.getElementById('master-pin-input');
  const resetNewPinInput = document.getElementById('reset-new-pin-input');
  const resetConfirmPinInput = document.getElementById('reset-confirm-pin-input');

  const itemModal = document.getElementById('item-modal');
  const itemForm = document.getElementById('item-form');
  const wishModal = document.getElementById('wish-modal');
  const wishForm = document.getElementById('wish-form');
  const pinModal = document.getElementById('pin-modal');
  const pinInput = document.getElementById('pin-input');
  const submitPinBtn = document.getElementById('submit-pin-btn');

  // Custom Redeem Confirm Modal Elements
  const redeemConfirmModal = document.getElementById('redeem-confirm-modal');
  const redeemModalHeaderTitle = document.getElementById('redeem-modal-header-title');
  const redeemGiftIcon = document.getElementById('redeem-gift-icon');
  const redeemGiftName = document.getElementById('redeem-gift-name');
  const redeemGiftCost = document.getElementById('redeem-gift-cost');
  const redeemBalanceAfter = document.getElementById('redeem-balance-after');
  const confirmRedeemBtn = document.getElementById('confirm-redeem-btn');
  let pendingRedeemItem = null;

  const toastNotification = document.getElementById('toast-notification');

  // Selected Avatar Temp State
  let selectedAvatar = '🏎️';

  // Audio Context (Web Audio API Synthesizer)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playChimeSound() {
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

      osc2.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.3); // E6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.log('Audio not allowed yet');
    }
  }

  function playBoingSound() {
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.log('Audio error');
    }
  }

  // Helper Formatter
  function formatVND(amount) {
    const formatted = Math.abs(amount).toLocaleString('vi-VN') + ' đ';
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  }

  function calculateAge(birthYear) {
    const age = CURRENT_YEAR - parseInt(birthYear);
    return age <= 0 ? 'Dưới 1 tuổi' : `${age} tuổi`;
  }

  // Toast Notice
  function showToast(message) {
    toastNotification.textContent = message;
    toastNotification.classList.remove('hidden');
    setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2500);
  }

  function compressImageFile(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Load Data from Server / Storage
  async function loadData() {
    let loadedFromLocal = false;
    const local = localStorage.getItem('bon_sam_rewards_data');
    if (local) {
      try {
        state = JSON.parse(local);
        loadedFromLocal = true;
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.profiles && Array.isArray(serverData.profiles)) {
          if (loadedFromLocal && state.profiles) {
            // Keep uploaded photo avatars if present in local
            serverData.profiles.forEach(sp => {
              const lp = state.profiles.find(p => p.id === sp.id);
              if (lp && lp.avatar && lp.avatar.startsWith('data:image/')) {
                sp.avatar = lp.avatar;
              }
            });
          }
          state = serverData;
        }
      }
    } catch (err) {
      console.warn('Backend fetch fallback to local state', err);
    }

    // Sanitize any legacy string avatars
    if (state.profiles && Array.isArray(state.profiles)) {
      state.profiles.forEach(p => {
        if (p.avatar === 'car_racer' || p.avatar === 'car') p.avatar = '🏎️';
        if (p.avatar === 'doll_princess' || p.avatar === 'doll') p.avatar = '👑';
      });
    }

    // Default fallbacks
    if (!state.profiles || state.profiles.length === 0) {
      state.profiles = [
        {
          id: 'p1',
          name: 'Bé Bon',
          gender: 'boy',
          birthYear: 2018,
          avatar: '🏎️',
          balance: 0,
          rewards: [
            { id: 'r1', title: 'Đi học đúng giờ', amount: 2000, icon: '🎒' },
            { id: 'r2', title: 'Tự giác làm bài tập', amount: 5000, icon: '✍️' },
            { id: 'r3', title: 'Giúp mẹ dọn bàn ăn', amount: 3000, icon: '🧹' }
          ],
          fines: [
            { id: 'f1', title: 'Không làm bài tập', amount: 5000, icon: '❌' },
            { id: 'f2', title: 'Xem TV quá giờ', amount: 3000, icon: '📺' }
          ],
          wishlist: [
            { id: 'w1', title: 'Xe Ô Tô Đồ Chơi Điều Khiển', targetAmount: 100000, icon: '🚗' }
          ],
          history: []
        }
      ];
      state.activeProfileId = 'p1';
    }

    // Force Parent Lock on F5 reload / app initialization
    state.isParentUnlocked = false;
    clearAutoLockTimer();

    renderApp();
  }

  async function saveData() {
    localStorage.setItem('bon_sam_rewards_data', JSON.stringify(state));
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
    } catch (err) {
      console.warn('Could not sync to backend server', err);
    }
  }

  function getActiveProfile() {
    return state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0];
  }

  function getActivePinCode() {
    const mode = state.pinMode || 'global';
    if (mode === 'per_profile') {
      const profile = getActiveProfile();
      return profile.pinCode || state.globalPinCode || state.pinCode || '1234';
    }
    return state.globalPinCode || state.pinCode || '1234';
  }

  function renderAvatarHTML(avatarVal, fallbackGender) {
    if (!avatarVal) avatarVal = fallbackGender === 'girl' ? '👑' : '🏎️';
    if (avatarVal === 'car_racer' || avatarVal === 'car') avatarVal = '🏎️';
    if (avatarVal === 'doll_princess' || avatarVal === 'doll') avatarVal = '👑';

    if (avatarVal.startsWith('data:image/') || avatarVal.startsWith('http://') || avatarVal.startsWith('https://')) {
      return `<img src="${avatarVal}" alt="Avatar">`;
    }
    return avatarVal;
  }

  // Main Render Routine
  function renderApp() {
    const profile = getActiveProfile();
    if (!profile) return;

    // 1. Dynamic Gender Theme
    if (profile.gender === 'girl') {
      body.className = 'theme-girl';
      document.querySelector('.theme-icon').textContent = '👑';
    } else {
      body.className = 'theme-boy';
      document.querySelector('.theme-icon').textContent = '🏎️';
    }

    // 2. Profiles Bar
    renderProfilesBar();

    // 3. Hero Card
    currentAvatar.innerHTML = renderAvatarHTML(profile.avatar, profile.gender);
    currentName.textContent = profile.name;
    currentAge.textContent = calculateAge(profile.birthYear);
    currentBirthyear.textContent = profile.birthYear;

    if (profile.gender === 'girl') {
      currentGenderTag.className = 'gender-tag girl';
      currentGenderTag.textContent = '👧 Nữ';
    } else {
      currentGenderTag.className = 'gender-tag boy';
      currentGenderTag.textContent = '👦 Nam';
    }

    // Balance
    const bal = profile.balance || 0;
    balanceAmount.textContent = formatVND(bal);
    if (bal >= 0) {
      balanceAmount.className = 'balance-value positive';
      balanceSubtext.textContent = bal === 0 ? 'Bắt đầu tích điểm thôi nào! 🚀' : 'Bé ngoan lắm! Tiếp tục phát huy nhé! 🌟';
    } else {
      balanceAmount.className = 'balance-value negative';
      balanceSubtext.textContent = 'Ôi không! Đang nợ bố mẹ, cố gắng làm việc tốt để bù lại nhé! 💪';
    }

    // Stats
    const totalEarned = (profile.history || [])
      .filter(h => h.type === 'reward')
      .reduce((sum, h) => sum + h.amount, 0);
    const totalFined = (profile.history || [])
      .filter(h => h.type === 'fine')
      .reduce((sum, h) => sum + h.amount, 0);

    statTotalReward.textContent = formatVND(totalEarned);
    statTotalFine.textContent = formatVND(-totalFined);

    // Lock Status
    lockStatusIcon.textContent = state.isParentUnlocked ? '🔓' : '🔒';
    const isGlobalPin = (state.pinMode || 'global') === 'global';
    const pinLabelText = isGlobalPin ? ' (Mã PIN dùng chung)' : ` (Mã PIN riêng ${profile.name})`;
    parentModeStatus.textContent = state.isParentUnlocked 
      ? `Trạng thái: 🔓 Đã mở khóa Bố Mẹ${pinLabelText}` 
      : `Trạng thái: 🔒 Đã khóa${pinLabelText}`;
    toggleParentModeBtn.textContent = state.isParentUnlocked ? 'Khóa Lại' : 'Mở Khóa Bố Mẹ';

    // PIN Mode Radio state sync
    pinModeRadios.forEach(radio => {
      radio.checked = radio.value === (state.pinMode || 'global');
    });

    // Render Sub-Views
    renderRewardsGrid();
    renderFinesGrid();
    renderWishlist();
    renderHistory();
    renderManageLists();
    renderManageProfiles();
  }

  function renderProfilesBar() {
    profilesList.innerHTML = state.profiles.map(p => `
      <div class="profile-chip ${p.id === state.activeProfileId ? 'active' : ''}" data-id="${p.id}">
        <span class="chip-avatar">${renderAvatarHTML(p.avatar, p.gender)}</span>
        <span>${p.name}</span>
      </div>
    `).join('');

    profilesList.querySelectorAll('.profile-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (state.activeProfileId !== chip.dataset.id) {
          state.activeProfileId = chip.dataset.id;
          
          // Re-lock ONLY if using individual per_profile PIN mode
          if ((state.pinMode || 'global') === 'per_profile') {
            state.isParentUnlocked = false;
            clearAutoLockTimer();
          }

          saveData();
          renderApp();
        }
      });
    });
  }

  function renderRewardsGrid() {
    const profile = getActiveProfile();
    const rewards = profile.rewards || [];

    if (rewards.length === 0) {
      rewardsGrid.innerHTML = '<p class="text-muted" style="grid-column: span 2;">Chưa có mục thưởng nào.</p>';
      return;
    }

    rewardsGrid.innerHTML = rewards.map(r => `
      <div class="action-card" data-id="${r.id}" data-type="reward">
        <div class="card-top">
          <span class="card-emoji">${r.icon || '🎁'}</span>
          <span class="card-amount">+${r.amount.toLocaleString('vi-VN')}đ</span>
        </div>
        <div class="card-title">${r.title}</div>
        <div class="card-bottom">
          <span class="group-subtitle">Nhấn để thưởng</span>
          <button class="btn-tap-action">+</button>
        </div>
      </div>
    `).join('');

    rewardsGrid.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('click', () => handleApplyAction(card.dataset.id, 'reward'));
    });
  }

  function renderFinesGrid() {
    const profile = getActiveProfile();
    const fines = profile.fines || [];

    if (fines.length === 0) {
      finesGrid.innerHTML = '<p class="text-muted" style="grid-column: span 2;">Chưa có mục phạt nào.</p>';
      return;
    }

    finesGrid.innerHTML = fines.map(f => `
      <div class="action-card" data-id="${f.id}" data-type="fine">
        <div class="card-top">
          <span class="card-emoji">${f.icon || '⚡'}</span>
          <span class="card-amount">-${f.amount.toLocaleString('vi-VN')}đ</span>
        </div>
        <div class="card-title">${f.title}</div>
        <div class="card-bottom">
          <span class="group-subtitle">Nhấn để phạt</span>
          <button class="btn-tap-action">-</button>
        </div>
      </div>
    `).join('');

    finesGrid.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('click', () => handleApplyAction(card.dataset.id, 'fine'));
    });
  }

  // Handle Apply Reward or Fine
  function handleApplyAction(itemId, type) {
    requireParentLock(() => {
      const profile = getActiveProfile();
      const list = type === 'reward' ? profile.rewards : profile.fines;
      const item = list.find(i => i.id === itemId);

      if (!item) return;

      const amount = item.amount;
      if (type === 'reward') {
        profile.balance = (profile.balance || 0) + amount;
        playChimeSound();

        // Confetti burst
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        showToast(`🎉 Đã thưởng +${amount.toLocaleString('vi-VN')}đ (${item.title})!`);
      } else {
        profile.balance = (profile.balance || 0) - amount;
        playBoingSound();

        // Shake animation
        document.querySelector('.profile-hero-card').classList.add('shake-animation');
        setTimeout(() => {
          document.querySelector('.profile-hero-card').classList.remove('shake-animation');
        }, 400);

        showToast(`⚡ Bị phạt -${amount.toLocaleString('vi-VN')}đ (${item.title})!`);
      }

      // Push History
      if (!profile.history) profile.history = [];
      profile.history.unshift({
        id: 'h_' + Date.now(),
        type: type,
        title: item.title,
        amount: amount,
        icon: item.icon,
        timestamp: new Date().toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
        newBalance: profile.balance
      });

      saveData();
      renderApp();
    });
  }

  // Wishlist / Piggy Bank
  function renderWishlist() {
    const profile = getActiveProfile();
    const wishlist = profile.wishlist || [];

    if (wishlist.length === 0) {
      wishlistItems.innerHTML = '<p class="text-muted text-center" style="padding:20px;">Chưa có món quà mơ ước nào. Hãy bấm thêm quà ngay!</p>';
      return;
    }

    wishlistItems.innerHTML = wishlist.map(w => {
      const bal = profile.balance > 0 ? profile.balance : 0;
      const pct = Math.min(100, Math.max(0, Math.round((bal / w.targetAmount) * 100)));
      const isAchieved = bal >= w.targetAmount;

      return `
        <div class="wish-card">
          <div class="wish-top">
            <div class="wish-icon">${w.icon || '🎁'}</div>
            <div class="wish-info">
              <div class="wish-title">${w.title}</div>
              <div class="wish-target">Mục tiêu: ${w.targetAmount.toLocaleString('vi-VN')}đ</div>
            </div>
            ${state.isParentUnlocked ? `<button class="btn-undo-item delete-wish" data-id="${w.id}">🗑️</button>` : ''}
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
          </div>
          <div class="wish-bottom-stats">
            <span>Tích lũy: ${pct}%</span>
            ${isAchieved ? `
              <button class="btn-redeem-pulse redeem-wish-btn" data-id="${w.id}">
                🎁 Đổi Quà Ngay (${w.targetAmount.toLocaleString('vi-VN')}đ)
              </button>
            ` : `
              <span style="color: var(--text-muted);">Còn thiếu ${(w.targetAmount - bal).toLocaleString('vi-VN')}đ</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    wishlistItems.querySelectorAll('.delete-wish').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        profile.wishlist = profile.wishlist.filter(w => w.id !== id);
        saveData();
        renderApp();
      });
    });

    wishlistItems.querySelectorAll('.redeem-wish-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = profile.wishlist.find(w => w.id === id);
        if (!item) return;

        requireParentLock(() => {
          pendingRedeemItem = item;
          const isBoy = profile.gender === 'boy';

          redeemModalHeaderTitle.textContent = isBoy 
            ? `🏎️ 🎁 Đổi Quà Thôi ${profile.name} Ơi!` 
            : `👑 🎁 Đổi Quà Thôi ${profile.name} Ơi!`;

          redeemGiftIcon.textContent = item.icon || '🎁';
          redeemGiftName.textContent = item.title;
          redeemGiftCost.textContent = `-${item.targetAmount.toLocaleString('vi-VN')} đ`;

          const remaining = profile.balance - item.targetAmount;
          redeemBalanceAfter.textContent = `${remaining.toLocaleString('vi-VN')} đ`;

          confirmRedeemBtn.textContent = isBoy ? '🏎️ ĐỔI QUÀ NGAY!' : '👑 ĐỔI QUÀ NGAY!';

          redeemConfirmModal.classList.add('active');
        });
      });
    });
  }

  // History Render
  function renderHistory() {
    const profile = getActiveProfile();
    const history = profile.history || [];

    if (history.length === 0) {
      historyList.innerHTML = '<p class="text-muted text-center" style="padding:20px;">Chưa có nhật ký thưởng phạt nào.</p>';
      return;
    }

    historyList.innerHTML = history.map(h => {
      const isReward = h.type === 'reward';
      const isRedeem = h.type === 'redeem';
      const amountPrefix = isReward ? '+' : '-';
      const cssClass = isReward ? 'reward' : (isRedeem ? 'fine' : 'fine');

      return `
        <div class="history-item ${cssClass}">
          <div class="history-icon">${h.icon || (isReward ? '🎁' : '⚡')}</div>
          <div class="history-details">
            <div class="history-title">${h.title} ${isRedeem ? '🛍️' : ''}</div>
            <div class="history-time">${h.timestamp}</div>
          </div>
          <div class="history-amount">${amountPrefix}${h.amount.toLocaleString('vi-VN')}đ</div>
          <button class="btn-undo-item undo-history-btn" data-id="${h.id}" title="Hủy tác động này">↩️</button>
        </div>
      `;
    }).join('');

    historyList.querySelectorAll('.undo-history-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        requireParentLock(() => {
          const entry = profile.history.find(h => h.id === id);
          if (entry) {
            // Reverse balance
            if (entry.type === 'reward') {
              profile.balance -= entry.amount;
            } else {
              profile.balance += entry.amount;
            }
            profile.history = profile.history.filter(h => h.id !== id);
            saveData();
            renderApp();
            showToast('↩️ Đã hoàn tác tác động!');
          }
        });
      });
    });
  }

  // Manage Settings Lists
  function renderManageLists() {
    const profile = getActiveProfile();

    manageRewardsList.innerHTML = (profile.rewards || []).map(r => `
      <div class="manage-item-row">
        <span>${r.icon} <strong>${r.title}</strong> (+${r.amount.toLocaleString('vi-VN')}đ)</span>
        ${state.isParentUnlocked ? `
          <div>
            <button class="btn-undo-item edit-item-btn" data-id="${r.id}" data-type="reward">✏️</button>
            <button class="btn-undo-item delete-item-btn" data-id="${r.id}" data-type="reward">🗑️</button>
          </div>
        ` : '🔒'}
      </div>
    `).join('');

    manageFinesList.innerHTML = (profile.fines || []).map(f => `
      <div class="manage-item-row">
        <span>${f.icon} <strong>${f.title}</strong> (-${f.amount.toLocaleString('vi-VN')}đ)</span>
        ${state.isParentUnlocked ? `
          <div>
            <button class="btn-undo-item edit-item-btn" data-id="${f.id}" data-type="fine">✏️</button>
            <button class="btn-undo-item delete-item-btn" data-id="${f.id}" data-type="fine">🗑️</button>
          </div>
        ` : '🔒'}
      </div>
    `).join('');

    // Attach Manage Delete/Edit Listeners
    document.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        if (type === 'reward') {
          profile.rewards = profile.rewards.filter(r => r.id !== id);
        } else {
          profile.fines = profile.fines.filter(f => f.id !== id);
        }
        saveData();
        renderApp();
      });
    });

    document.querySelectorAll('.edit-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const list = type === 'reward' ? profile.rewards : profile.fines;
        const item = list.find(i => i.id === id);
        if (item) {
          document.getElementById('item-id-input').value = item.id;
          document.getElementById('item-type-input').value = type;
          document.getElementById('item-title').value = item.title;
          document.getElementById('item-amount').value = item.amount;
          document.getElementById('item-icon').value = item.icon;
          document.getElementById('item-modal-title').textContent = type === 'reward' ? 'Sửa Mục Thưởng 🎁' : 'Sửa Mục Phạt ⚡';
          itemModal.classList.add('active');
        }
      });
    });
  }

  function renderManageProfiles() {
    if (!manageProfilesList) return;
    manageProfilesList.innerHTML = state.profiles.map(p => `
      <div class="manage-profile-card ${p.id === state.activeProfileId ? 'active-profile' : ''}">
        <div class="manage-profile-info">
          <div class="manage-profile-avatar">${renderAvatarHTML(p.avatar, p.gender)}</div>
          <div class="manage-profile-details">
            <h5>${p.name} ${p.id === state.activeProfileId ? '🌟' : ''}</h5>
            <p>${p.gender === 'girl' ? '👧 Bé Nữ' : '👦 Bé Nam'} • ${calculateAge(p.birthYear)} (${p.birthYear})</p>
          </div>
        </div>
        <div class="manage-profile-actions">
          ${state.isParentUnlocked ? `
            <button class="btn-undo-item edit-profile-btn" data-id="${p.id}" title="Chỉnh sửa">✏️</button>
            ${state.profiles.length > 1 ? `<button class="btn-undo-item delete-profile-btn" data-id="${p.id}" title="Xóa bé">🗑️</button>` : ''}
          ` : '🔒'}
        </div>
      </div>
    `).join('');

    manageProfilesList.querySelectorAll('.edit-profile-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditProfileModal(btn.dataset.id));
    });

    manageProfilesList.querySelectorAll('.delete-profile-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProfile(btn.dataset.id));
    });
  }

  function openEditProfileModal(profileId) {
    requireParentLock(() => {
      const profile = state.profiles.find(p => p.id === profileId);
      if (!profile) return;

      document.getElementById('profile-id-input').value = profile.id;
      profileNameInput.value = profile.name;

      const genderRadio = document.querySelector(`input[name="profile-gender"][value="${profile.gender}"]`);
      if (genderRadio) genderRadio.checked = true;

      profileBirthyearSelect.value = profile.birthYear;
      calculatedAgePreview.textContent = `Tuổi tính toán: ${calculateAge(profile.birthYear)}`;

      selectedAvatar = profile.avatar || (profile.gender === 'girl' ? '👑' : '🏎️');
      renderAvatarPicker(profile.gender);

      document.getElementById('profile-modal-title').textContent = `Sửa Thông Tin Bé ${profile.name} ✏️`;
      if (deleteProfileModalBtn) {
        if (state.profiles.length > 1) {
          deleteProfileModalBtn.classList.remove('hidden');
        } else {
          deleteProfileModalBtn.classList.add('hidden');
        }
      }

      if (perProfilePinGroup) {
        if ((state.pinMode || 'global') === 'per_profile') {
          perProfilePinGroup.classList.remove('hidden');
          if (profilePinInput) profilePinInput.value = profile.pinCode || state.globalPinCode || '1234';
        } else {
          perProfilePinGroup.classList.add('hidden');
        }
      }

      profileModal.classList.add('active');
    });
  }

  function deleteProfile(profileId) {
    requireParentLock(() => {
      if (state.profiles.length <= 1) {
        alert('Không thể xóa! Cần duy trì ít nhất 1 hồ sơ bé.');
        return;
      }
      const profile = state.profiles.find(p => p.id === profileId);
      if (!profile) return;

      if (confirm(`Bạn có chắc chắn muốn xóa toàn bộ hồ sơ của "${profile.name}" không?`)) {
        state.profiles = state.profiles.filter(p => p.id !== profileId);
        if (state.activeProfileId === profileId) {
          state.activeProfileId = state.profiles[0].id;
        }
        saveData();
        renderApp();
        showToast(`🗑️ Đã xóa hồ sơ của ${profile.name}!`);
        if (profileModal) profileModal.classList.remove('active');
      }
    });
  }

  // Navigation Tab Switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Profile Modal Logic
  function populateBirthYearSelect() {
    profileBirthyearSelect.innerHTML = '';
    for (let y = CURRENT_YEAR; y >= 2010; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = `${y} (Tính: ${CURRENT_YEAR - y} tuổi)`;
      profileBirthyearSelect.appendChild(opt);
    }
  }
  populateBirthYearSelect();

  profileBirthyearSelect.addEventListener('change', () => {
    calculatedAgePreview.textContent = `Tuổi tính toán: ${calculateAge(profileBirthyearSelect.value)}`;
  });

  function renderAvatarPicker(gender) {
    const avatars = gender === 'girl' ? AVATARS_GIRL : AVATARS_BOY;
    avatarPicker.innerHTML = avatars.map(a => `
      <div class="avatar-item ${a === selectedAvatar ? 'selected' : ''}">${a}</div>
    `).join('');

    avatarPicker.querySelectorAll('.avatar-item').forEach(item => {
      item.addEventListener('click', () => {
        avatarPicker.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedAvatar = item.textContent;
      });
    });
  }

  document.querySelectorAll('input[name="profile-gender"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedAvatar = e.target.value === 'girl' ? '👑' : '🏎️';
      renderAvatarPicker(e.target.value);
    });
  });

  addProfileBtn.addEventListener('click', () => {
    requireParentLock(() => {
      document.getElementById('profile-id-input').value = '';
      profileNameInput.value = '';
      document.querySelector('input[name="profile-gender"][value="boy"]').checked = true;
      selectedAvatar = '🏎️';
      renderAvatarPicker('boy');
      document.getElementById('profile-modal-title').textContent = 'Thêm Bé Mới 👶';
      if (deleteProfileModalBtn) deleteProfileModalBtn.classList.add('hidden');
      profileModal.classList.add('active');
    });
  });

  if (editCurrentProfileBtn) {
    editCurrentProfileBtn.addEventListener('click', () => {
      openEditProfileModal(state.activeProfileId);
    });
  }

  if (btnAddProfileSettings) {
    btnAddProfileSettings.addEventListener('click', () => {
      requireParentLock(() => {
        document.getElementById('profile-id-input').value = '';
        profileNameInput.value = '';
        document.querySelector('input[name="profile-gender"][value="boy"]').checked = true;
        selectedAvatar = '🏎️';
        renderAvatarPicker('boy');
        document.getElementById('profile-modal-title').textContent = 'Thêm Bé Mới 👶';
        if (deleteProfileModalBtn) deleteProfileModalBtn.classList.add('hidden');
        profileModal.classList.add('active');
      });
    });
  }

  if (deleteProfileModalBtn) {
    deleteProfileModalBtn.addEventListener('click', () => {
      const currentEditingId = document.getElementById('profile-id-input').value;
      if (currentEditingId) {
        deleteProfile(currentEditingId);
      }
    });
  }

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('profile-id-input').value || ('p_' + Date.now());
    const name = profileNameInput.value.trim();
    const gender = document.querySelector('input[name="profile-gender"]:checked').value;
    const birthYear = parseInt(profileBirthyearSelect.value);

    let profile = state.profiles.find(p => p.id === id);
    const isNew = !profile;

    if (isNew) {
      profile = {
        id: id,
        name: name,
        gender: gender,
        birthYear: birthYear,
        avatar: selectedAvatar,
        pinCode: (state.pinMode === 'per_profile' && profilePinInput && profilePinInput.value) ? profilePinInput.value.trim() : (state.globalPinCode || '1234'),
        balance: 0,
        rewards: [
          { id: 'r1', title: 'Đi học đúng giờ', amount: 2000, icon: '🎒' },
          { id: 'r2', title: 'Tự giác làm bài tập', amount: 5000, icon: '✍️' }
        ],
        fines: [
          { id: 'f1', title: 'Không làm bài tập', amount: 5000, icon: '❌' }
        ],
        wishlist: [],
        history: []
      };
      state.profiles.push(profile);
    } else {
      profile.name = name;
      profile.gender = gender;
      profile.birthYear = birthYear;
      profile.avatar = selectedAvatar;
      if (state.pinMode === 'per_profile' && profilePinInput && profilePinInput.value) {
        profile.pinCode = profilePinInput.value.trim();
      }
    }

    state.activeProfileId = id;
    profileModal.classList.remove('active');
    saveData();
    renderApp();
    showToast(isNew ? `👶 Đã thêm bé mới ${name}!` : `✏️ Đã cập nhật thông tin bé ${name}!`);
  });

  // Items (Rewards & Fines) Modal & Form
  document.getElementById('btn-add-custom-reward').addEventListener('click', () => {
    if (!requireParentLock()) return;
    document.getElementById('item-id-input').value = '';
    document.getElementById('item-type-input').value = 'reward';
    document.getElementById('item-title').value = '';
    document.getElementById('item-amount').value = 2000;
    document.getElementById('item-icon').value = '🎁';
    document.getElementById('item-modal-title').textContent = 'Thêm Mục Thưởng Mới 🎁';
    itemModal.classList.add('active');
  });

  document.getElementById('btn-add-custom-fine').addEventListener('click', () => {
    if (!requireParentLock()) return;
    document.getElementById('item-id-input').value = '';
    document.getElementById('item-type-input').value = 'fine';
    document.getElementById('item-title').value = '';
    document.getElementById('item-amount').value = 5000;
    document.getElementById('item-icon').value = '⚡';
    document.getElementById('item-modal-title').textContent = 'Thêm Mục Phạt Mới ⚡';
    itemModal.classList.add('active');
  });

  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = getActiveProfile();
    const id = document.getElementById('item-id-input').value || ('item_' + Date.now());
    const type = document.getElementById('item-type-input').value;
    const title = document.getElementById('item-title').value.trim();
    const amount = parseInt(document.getElementById('item-amount').value);
    const icon = document.getElementById('item-icon').value.trim() || (type === 'reward' ? '🎁' : '⚡');

    const list = type === 'reward' ? profile.rewards : profile.fines;
    const existing = list.find(i => i.id === id);

    if (existing) {
      existing.title = title;
      existing.amount = amount;
      existing.icon = icon;
    } else {
      list.push({ id, title, amount, icon });
    }

    itemModal.classList.remove('active');
    saveData();
    renderApp();
  });

  // Wishlist Form
  document.getElementById('add-wish-btn').addEventListener('click', () => {
    requireParentLock(() => {
      document.getElementById('wish-title').value = '';
      document.getElementById('wish-amount').value = 100000;
      document.getElementById('wish-icon').value = getActiveProfile().gender === 'girl' ? '👑' : '🏎️';
      wishModal.classList.add('active');
    });
  });

  wishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = getActiveProfile();
    const title = document.getElementById('wish-title').value.trim();
    const amount = parseInt(document.getElementById('wish-amount').value);
    const icon = document.getElementById('wish-icon').value.trim() || '🎁';

    if (!profile.wishlist) profile.wishlist = [];
    profile.wishlist.push({
      id: 'w_' + Date.now(),
      title,
      targetAmount: amount,
      icon
    });

    wishModal.classList.remove('active');
    saveData();
    renderApp();
    showToast('🎁 Đã thêm món quà mơ ước mới!');
  });

  // Clear History
  document.getElementById('clear-history-btn').addEventListener('click', () => {
    requireParentLock(() => {
      if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký thưởng phạt không?')) {
        const profile = getActiveProfile();
        profile.history = [];
        saveData();
        renderApp();
        showToast('🧹 Đã xóa toàn bộ nhật ký!');
      }
    });
  });

  // Modal Closers
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      pendingLockCallback = null;
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  // Parent Lock System & 5-Minute Auto-Lock Timer
  let pendingLockCallback = null;
  let unlockTimer = null;

  function startAutoLockTimer() {
    if (unlockTimer) clearTimeout(unlockTimer);
    // 5 minutes (300,000 ms)
    unlockTimer = setTimeout(() => {
      if (state.isParentUnlocked) {
        state.isParentUnlocked = false;
        renderApp();
        showToast('🔒 Đã tự động khóa Bố Mẹ (hết 5 phút)');
      }
    }, 5 * 60 * 1000);
  }

  function clearAutoLockTimer() {
    if (unlockTimer) {
      clearTimeout(unlockTimer);
      unlockTimer = null;
    }
  }

  function requireParentLock(callback) {
    if (state.isParentUnlocked) {
      if (typeof callback === 'function') callback();
      return true;
    }
    pendingLockCallback = typeof callback === 'function' ? callback : null;
    pinInput.value = '';

    const profile = getActiveProfile();
    const pinTitle = document.getElementById('pin-modal-title');
    const pinDesc = document.getElementById('pin-modal-desc');
    const isGlobal = (state.pinMode || 'global') === 'global';

    if (pinTitle) {
      pinTitle.textContent = isGlobal ? '🔒 Nhập Mã PIN Bố Mẹ (Dùng Chung)' : `🔒 Nhập Mã PIN Bố Mẹ (${profile.name})`;
    }
    if (pinDesc) {
      pinDesc.textContent = isGlobal 
        ? 'Nhập mã PIN Bố Mẹ dùng chung để mở khóa:' 
        : `Nhập mã PIN Bố Mẹ dành riêng cho ${profile.name} để mở khóa:`;
    }

    pinModal.classList.add('active');
    return false;
  }

  parentLockBtn.addEventListener('click', () => {
    if (state.isParentUnlocked) {
      state.isParentUnlocked = false;
      clearAutoLockTimer();
      renderApp();
      showToast('🔒 Đã khóa chế độ Bố Mẹ');
    } else {
      requireParentLock();
    }
  });

  toggleParentModeBtn.addEventListener('click', () => {
    if (state.isParentUnlocked) {
      state.isParentUnlocked = false;
      clearAutoLockTimer();
      renderApp();
      showToast('🔒 Đã khóa chế độ Bố Mẹ');
    } else {
      requireParentLock();
    }
  });

  // Change PIN Modal Logic
  const changePinModal = document.getElementById('change-pin-modal');
  const changePinForm = document.getElementById('change-pin-form');
  const changePinBtn = document.getElementById('change-pin-btn');

  // Listen to PIN Mode Radio switches
  pinModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const newMode = e.target.value;
      if ((state.pinMode || 'global') === newMode) return;

      requireParentLock(() => {
        state.pinMode = newMode;
        saveData();
        renderApp();
        showToast(newMode === 'global' 
          ? '🌐 Đã chuyển sang chế độ 1 Mã PIN Dùng Chung' 
          : '👶 Đã chuyển sang chế độ Mã PIN Riêng Từng Bé');
      });
    });
  });

  if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
      requireParentLock(() => {
        const profile = getActiveProfile();
        const changePinTitle = document.getElementById('change-pin-modal-title');
        const isGlobal = (state.pinMode || 'global') === 'global';
        if (changePinTitle) {
          changePinTitle.textContent = isGlobal 
            ? '🔑 Đổi Mã PIN Bố Mẹ (Dùng Chung)' 
            : `🔑 Đổi Mã PIN Bố Mẹ (${profile.name})`;
        }

        document.getElementById('current-pin-input').value = '';
        document.getElementById('new-pin-input').value = '';
        document.getElementById('confirm-pin-input').value = '';
        changePinModal.classList.add('active');
      });
    });
  }

  if (changePinForm) {
    changePinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const profile = getActiveProfile();
      const currentPin = document.getElementById('current-pin-input').value;
      const newPin = document.getElementById('new-pin-input').value;
      const confirmPin = document.getElementById('confirm-pin-input').value;

      if (currentPin !== getActivePinCode()) {
        alert('Mã PIN Bố Mẹ hiện tại không chính xác!');
        return;
      }

      if (!/^\d{4}$/.test(newPin)) {
        alert('Mã PIN mới phải gồm đúng 4 chữ số!');
        return;
      }

      if (newPin !== confirmPin) {
        alert('Xác nhận mã PIN mới không trùng khớp!');
        return;
      }

      if ((state.pinMode || 'global') === 'global') {
        state.globalPinCode = newPin;
        state.pinCode = newPin;
        saveData();
        changePinModal.classList.remove('active');
        showToast('🔑 Đã đổi Mã PIN Bố Mẹ dùng chung thành công!');
      } else {
        profile.pinCode = newPin;
        saveData();
        changePinModal.classList.remove('active');
        showToast(`🔑 Đã đổi mã PIN Bố Mẹ cho ${profile.name} thành công!`);
      }
    });
  }

  // Change Master PIN Modal Logic
  const changeMasterPinModal = document.getElementById('change-master-pin-modal');
  const changeMasterPinForm = document.getElementById('change-master-pin-form');
  const changeMasterPinBtn = document.getElementById('change-master-pin-btn');

  if (changeMasterPinBtn) {
    changeMasterPinBtn.addEventListener('click', () => {
      requireParentLock(() => {
        document.getElementById('current-master-pin-input').value = '';
        document.getElementById('new-master-pin-input').value = '';
        document.getElementById('confirm-master-pin-input').value = '';
        if (changeMasterPinModal) changeMasterPinModal.classList.add('active');
      });
    });
  }

  if (changeMasterPinForm) {
    changeMasterPinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentMaster = document.getElementById('current-master-pin-input').value.trim();
      const newMaster = document.getElementById('new-master-pin-input').value.trim();
      const confirmMaster = document.getElementById('confirm-master-pin-input').value.trim();

      const expectedMaster = state.masterPinCode || '9999';
      if (currentMaster !== expectedMaster) {
        alert('Mã PIN Master hiện tại không chính xác!');
        return;
      }

      if (!/^\d{4}$/.test(newMaster)) {
        alert('Mã PIN Master mới phải gồm đúng 4 chữ số!');
        return;
      }

      if (newMaster !== confirmMaster) {
        alert('Xác nhận mã PIN Master mới không trùng khớp!');
        return;
      }

      state.masterPinCode = newMaster;
      saveData();
      if (changeMasterPinModal) changeMasterPinModal.classList.remove('active');
      showToast('🆘 Đã đổi Mã PIN Master Khôi Phục thành công!');
    });
  }

  // Forgot PIN & Reset PIN using Master PIN Logic
  if (forgotPinBtn) {
    forgotPinBtn.addEventListener('click', () => {
      if (pinModal) pinModal.classList.remove('active');
      if (masterPinInput) masterPinInput.value = '';
      if (resetNewPinInput) resetNewPinInput.value = '';
      if (resetConfirmPinInput) resetConfirmPinInput.value = '';
      if (resetPinModal) resetPinModal.classList.add('active');
    });
  }

  if (resetPinForm) {
    resetPinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const masterPin = masterPinInput.value.trim();
      const newPin = resetNewPinInput.value.trim();
      const confirmPin = resetConfirmPinInput.value.trim();

      const expectedMasterPin = state.masterPinCode || '9999';
      if (masterPin !== expectedMasterPin) {
        alert('Mã PIN Master Khôi Phục không chính xác! (Mặc định: 9999)');
        return;
      }

      if (!/^\d{4}$/.test(newPin)) {
        alert('Mã PIN mới phải gồm đúng 4 chữ số!');
        return;
      }

      if (newPin !== confirmPin) {
        alert('Xác nhận mã PIN mới không trùng khớp!');
        return;
      }

      const profile = getActiveProfile();
      if ((state.pinMode || 'global') === 'global') {
        state.globalPinCode = newPin;
        state.pinCode = newPin;
      } else {
        profile.pinCode = newPin;
      }

      state.isParentUnlocked = true;
      startAutoLockTimer();

      saveData();
      if (resetPinModal) resetPinModal.classList.remove('active');
      renderApp();

      showToast('🔑 Đã khôi phục và đặt lại mã PIN Bố Mẹ mới thành công!');

      if (pendingLockCallback) {
        const cb = pendingLockCallback;
        pendingLockCallback = null;
        cb();
      }
    });
  }

  submitPinBtn.addEventListener('click', () => {
    const currentPinCode = getActivePinCode();
    const profile = getActiveProfile();
    if (pinInput.value === currentPinCode) {
      state.isParentUnlocked = true;
      startAutoLockTimer();
      pinModal.classList.remove('active');
      renderApp();
      showToast(`🔓 Đã mở khóa Bố Mẹ cho ${profile.name} (duy trì 5 phút)!`);

      if (pendingLockCallback) {
        const cb = pendingLockCallback;
        pendingLockCallback = null;
        cb();
      }
    } else {
      alert(`Mã PIN Bố Mẹ cho ${profile.name} không đúng! Vui lòng thử lại.`);
    }
  });

  // Confirm Redeem Action
  if (confirmRedeemBtn) {
    confirmRedeemBtn.addEventListener('click', () => {
      if (!pendingRedeemItem) return;
      const profile = getActiveProfile();
      const item = pendingRedeemItem;

      // Deduct item cost
      profile.balance -= item.targetAmount;

      // Push history log
      if (!profile.history) profile.history = [];
      profile.history.unshift({
        id: 'h_' + Date.now(),
        type: 'redeem',
        title: `Đổi quà: ${item.title}`,
        amount: item.targetAmount,
        icon: item.icon || '🎁',
        timestamp: new Date().toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
        newBalance: profile.balance
      });

      // Celebrate sound & confetti
      playChimeSound();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      }

      redeemConfirmModal.classList.remove('active');
      pendingRedeemItem = null;

      saveData();
      renderApp();
      showToast(`🎉 Chúc mừng ${profile.name} đã đổi quà "${item.title}" thành công!`);
    });
  }

  // Change Avatar Modal Logic
  const changeAvatarTrigger = document.getElementById('change-avatar-trigger');
  const avatarModal = document.getElementById('avatar-modal');
  const avatarModalPreview = document.getElementById('avatar-modal-preview');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const avatarModalPicker = document.getElementById('avatar-modal-picker');
  const saveAvatarBtn = document.getElementById('save-avatar-btn');
  let tempAvatarValue = '';

  if (changeAvatarTrigger) {
    changeAvatarTrigger.addEventListener('click', () => {
      requireParentLock(() => {
        const profile = getActiveProfile();
        tempAvatarValue = profile.avatar || (profile.gender === 'girl' ? '👑' : '🏎️');
        avatarModalPreview.innerHTML = renderAvatarHTML(tempAvatarValue, profile.gender);

        const presets = profile.gender === 'girl' ? AVATARS_GIRL : AVATARS_BOY;
        avatarModalPicker.innerHTML = presets.map(a => `
          <div class="avatar-item ${a === tempAvatarValue ? 'selected' : ''}">${a}</div>
        `).join('');

        avatarModalPicker.querySelectorAll('.avatar-item').forEach(item => {
          item.addEventListener('click', () => {
            avatarModalPicker.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            tempAvatarValue = item.textContent;
            avatarModalPreview.innerHTML = renderAvatarHTML(tempAvatarValue, profile.gender);
          });
        });

        if (avatarFileInput) avatarFileInput.value = '';
        if (avatarModal) avatarModal.classList.add('active');
      });
    });
  }

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        compressImageFile(file, 250, 250, 0.85, (compressedDataUrl) => {
          tempAvatarValue = compressedDataUrl;
          avatarModalPreview.innerHTML = `<img src="${tempAvatarValue}" alt="Avatar Preview">`;
          if (avatarModalPicker) {
            avatarModalPicker.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('selected'));
          }
        });
      }
    });
  }

  if (saveAvatarBtn) {
    saveAvatarBtn.addEventListener('click', () => {
      const profile = getActiveProfile();
      profile.avatar = tempAvatarValue;
      saveData();
      if (avatarModal) avatarModal.classList.remove('active');
      renderApp();
      showToast('📷 Đã cập nhật ảnh đại diện mới cho bé!');
    });
  }

  // Boot Application
  loadData();
});
