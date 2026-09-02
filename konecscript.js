// Отслеживание открытия клавиатуры
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' && (e.target.type === 'text' || e.target.type === 'number')) {
                document.body.classList.add('keyboard-open');
            }
        });
        document.addEventListener('focusout', (e) => {
            if (e.target.tagName === 'INPUT' && (e.target.type === 'text' || e.target.type === 'number')) {
                setTimeout(() => {
                    const kb = document.getElementById('math-keyboard');
                    const activeEl = document.activeElement;
                    const isNativeInputFocused = activeEl && activeEl.tagName === 'INPUT' && (activeEl.type === 'text' || activeEl.type === 'number');
                    if (!isNativeInputFocused && (!kb || !kb.classList.contains('visible'))) {
                        document.body.classList.remove('keyboard-open');
                    }
                }, 50);
            }
        });
// ==================== FIREBASE: АВТОРИЗАЦИЯ ====================
onFirebaseReady(() => {
  const auth = window.firebaseAuth;

  const authOverlay = document.getElementById("auth-overlay");
  const authAccountBtn = document.getElementById("auth-account-btn");
  const authTitle = document.getElementById("auth-title");
  const authEmail = document.getElementById("auth-email");
  const authPassword = document.getElementById("auth-password");
  const authError = document.getElementById("auth-error");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const authToggle = document.getElementById("auth-toggle");
  const authCloseBtn = document.getElementById("auth-close-btn");
  const togglePasswordBtn = document.getElementById("auth-toggle-password");
const eyeIcon = document.getElementById("auth-eye-icon");

togglePasswordBtn.addEventListener("click", () => {
  const isHidden = authPassword.type === "password";
  authPassword.type = isHidden ? "text" : "password";
  eyeIcon.innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
});

  let isRegisterMode = false;

  // Открыть окно входа
  authAccountBtn.addEventListener("click", () => {
    if (auth.currentUser) {
      // Если уже вошёл — кнопка работает как "Выйти"
      if (confirm("Выйти из аккаунта?")) {
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js").then(({ signOut }) => {
          signOut(auth);
          localStorage.removeItem("platformLogin");
        });
      }
      return;
    }
    authError.style.display = "none";
    authEmail.value = "";
    authPassword.value = "";
    authOverlay.classList.remove("hidden");
  });

  // Клик по фону — закрыть окно
  authOverlay.addEventListener("click", (e) => {
    if (e.target === authOverlay) {
      authOverlay.classList.add("hidden");
    }
  });

    // Клик по крестику — закрыть окно
        authCloseBtn.addEventListener("click", () => {
          authOverlay.classList.add("hidden");
        });

        // Прокрутка к полю при открытии клавиатуры
        [authEmail, authPassword].forEach((input) => {
          input.addEventListener("focus", () => {
            setTimeout(() => {
              input.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
          });
        });

  // Переключение между "Вход" и "Регистрация"
  authToggle.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;
    authTitle.textContent = isRegisterMode ? "Регистрация" : "Вход";
    authSubmitBtn.querySelector(".auth-btn-text").textContent = isRegisterMode ? "Зарегистрироваться" : "Войти";
    authToggle.textContent = isRegisterMode ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться";
    authError.style.display = "none";
  });

  // Отправка формы
  authSubmitBtn.addEventListener("click", async () => {
    authSubmitBtn.classList.add("loading");
authSubmitBtn.disabled = true;
    const email = authEmail.value.trim();
    const password = authPassword.value;
    authError.style.display = "none";

    if (!email || !password) {
    authError.textContent = "Заполните все поля";
    authError.style.display = "block";
    authSubmitBtn.classList.remove("loading");
    authSubmitBtn.disabled = false;
    return;
    }

const { signInWithCustomToken } =
    await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js");

async function attemptAuthRequest(action, email, password) {
    const res = await fetch("https://d5dkes6tf8o0uff54egi.4b4k4pg5.apigw.yandexcloud.net/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, login: email, password })
    });
    const data = await res.json();
    return { res, data };
}

try {
    const action = isRegisterMode ? "register" : "login";
    let result;
    try {
        result = await attemptAuthRequest(action, email, password);
    } catch (err1) {
        await new Promise(r => setTimeout(r, 1000));
        try {
            result = await attemptAuthRequest(action, email, password);
        } catch (err2) {
            await new Promise(r => setTimeout(r, 1000));
            result = await attemptAuthRequest(action, email, password);
        }
    }

    const { res, data } = result;

    if (!res.ok) {
        authError.textContent = data.error || "Ошибка входа";
        authError.style.display = "block";
        return;
    }

    await signInWithCustomToken(auth, data.token);
    localStorage.setItem("platformLogin", email);
    authOverlay.classList.add("hidden");
} catch (err) {
    authError.textContent = "Ошибка соединения с сервером";
    authError.style.display = "block";
} finally {
    authSubmitBtn.classList.remove("loading");
    authSubmitBtn.disabled = false;
}
  });

  // Слежение за состоянием входа — обновляем текст кнопки
  import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js").then(({ onAuthStateChanged }) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
    authAccountBtn.classList.add('hidden');
} else {
    authAccountBtn.textContent = "Войти";
    authAccountBtn.classList.remove('hidden');
      }
    });
  });

  function translateAuthError(code) {
    const map = {
      "auth/email-already-in-use": "Этот email уже зарегистрирован",
      "auth/invalid-email": "Некорректный email",
      "auth/weak-password": "Пароль слишком короткий (минимум 6 символов)",
      "auth/invalid-credential": "Неверный email или пароль",
      "auth/too-many-requests": "Слишком много попыток, попробуйте позже"
    };
    return map[code] || "Ошибка: " + code;
  }
});
// ==================== FIREBASE: ПРОГРЕСС УЧЕНИКА ====================
let userProgress = {};

async function markLessonComplete(topicId, lessonId, failedTasks) {
  const auth = window.firebaseAuth;
  const db = window.firebaseDb;
  if (!auth.currentUser) return;

  if (!userProgress[topicId]) userProgress[topicId] = {};
  userProgress[topicId][lessonId] = { completed: true, failedTasks: failedTasks };
  saveProgressToLocalCache(auth.currentUser.uid);

  const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js");

  try {
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        progress: {
          [topicId]: {
            [lessonId]: {
              completed: true,
              failedTasks: failedTasks
            }
          }
        }
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Ошибка сохранения прогресса:", err);
  }
}

function saveProgressToLocalCache(uid) {
  try {
    localStorage.setItem("cachedProgress_" + uid, JSON.stringify(userProgress));
  } catch (err) {
    console.error("Ошибка сохранения кэша прогресса:", err);
  }
}

async function loadUserProgress() {
  const auth = window.firebaseAuth;
  const db = window.firebaseDb;
  if (!auth.currentUser) {
    userProgress = {};
    return;
  }

  try {
    const cached = localStorage.getItem("cachedProgress_" + auth.currentUser.uid);
    if (cached) userProgress = JSON.parse(cached);
  } catch (err) {
    console.error("Ошибка чтения кэша прогресса:", err);
  }

  const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js");

  try {
    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    userProgress = snap.exists() ? (snap.data().progress || {}) : {};
    saveProgressToLocalCache(auth.currentUser.uid);
  } catch (err) {
    console.error("Ошибка загрузки прогресса:", err);
  }
}
onFirebaseReady(() => {
  const auth = window.firebaseAuth;
  import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js").then(({ onAuthStateChanged }) => {
    onAuthStateChanged(auth, async () => {
      await loadUserProgress();
    });
  });
});

function renderLevelCircleCheckmark(btn, animate) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "level-check-svg" + (animate ? "" : " visible"));
    svg.setAttribute("viewBox", "0 0 100 100");

    const btnRadius = 50;
    const strokeWidth = 7;
    const ringRadius = btnRadius - strokeWidth - (strokeWidth / 2);

    const ring = document.createElementNS(svgNS, "circle");
    ring.setAttribute("class", "level-check-ring");
    ring.setAttribute("cx", "50");
    ring.setAttribute("cy", "50");
    ring.setAttribute("r", ringRadius);
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "white");
    ring.setAttribute("stroke-width", strokeWidth);
    ring.setAttribute("stroke-linecap", "round");
    ring.style.transformOrigin = "50px 50px";
    ring.style.transform = "rotate(-90deg)";

    const check = document.createElementNS(svgNS, "path");
    check.setAttribute("class", "level-check-mark");
    check.setAttribute("d", "M33 51 L45 63 L69 37");
    check.setAttribute("fill", "none");
    check.setAttribute("stroke", "white");
    check.setAttribute("stroke-width", "8");
    check.setAttribute("stroke-linecap", "round");
    check.setAttribute("stroke-linejoin", "round");

    svg.appendChild(ring);
    svg.appendChild(check);
    btn.appendChild(svg);

    const ringLength = 2 * Math.PI * ringRadius;
    const checkLength = check.getTotalLength();

    ring.style.strokeDasharray = ringLength;
    check.style.strokeDasharray = checkLength;

    if (animate) {
        ring.style.transition = 'none';
        check.style.transition = 'none';
        ring.style.strokeDashoffset = ringLength;
        check.style.strokeDashoffset = checkLength;
        svg.classList.add('visible');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                ring.style.transition = 'stroke-dashoffset 1.0s ease';
                ring.style.strokeDashoffset = 0;

                setTimeout(() => {
                    check.style.transition = 'stroke-dashoffset 0.7s ease';
                    check.style.strokeDashoffset = 0;
                }, 350);
            });
        });
    } else {
        ring.style.strokeDashoffset = 0;
        check.style.strokeDashoffset = 0;
    }
}

function animateJustCompletedLesson() {
    if (!justCompletedLessonId) return;
    const btn = document.querySelector(`#path-container .level-circle[data-lesson-id="${justCompletedLessonId}"]`);
    if (btn) {
        const numberSpan = btn.querySelector('.level-number-text');
        renderLevelCircleCheckmark(btn, true);
        if (numberSpan) numberSpan.classList.add('hidden-anim');
    }
    justCompletedLessonId = null;
}

// --- ЛОГИКА СТРАНИЦЫ АККАУНТА ---

function initAccountLogic() {
    const dotsBtn = document.getElementById('email-dots-btn');
    const actionsPanel = document.getElementById('email-actions-panel');
    const overallWrapper = document.getElementById('overall-progress-wrapper');
    const btnLogout = document.getElementById('btn-logout');
    const btnDelete = document.getElementById('btn-delete');

    // Троеточие
    dotsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = actionsPanel.classList.toggle('open');
        dotsBtn.classList.toggle('active', isExpanded);
        overallWrapper.classList.toggle('collapsed', isExpanded);
    });

    // Закрытие панели при клике вне её
    document.addEventListener('click', () => {
        actionsPanel?.classList.remove('open');
        dotsBtn?.classList.remove('active');
        overallWrapper?.classList.remove('collapsed');
    });

    // Кнопка выхода из аккаунта
    btnLogout?.addEventListener('click', (e) => {
        e.stopPropagation();
        showAccountModal('logout');
    });

    // Кнопка удаления аккаунта
btnDelete?.addEventListener('click', (e) => {
    e.stopPropagation();
    showAccountModal('delete');
});

    // Изменение состояния авторизации
    onFirebaseReady(() => {
        const auth = window.firebaseAuth;
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js").then(({ onAuthStateChanged }) => {
            onAuthStateChanged(auth, (user) => {
                updateAccountUI(user);
            });
        });
    });
}

function updateAccountUI(user = null) {
    const emailDisplay = document.getElementById('user-email-display');
    const currentUser = user || (window.firebaseAuth ? window.firebaseAuth.currentUser : null);

    if (currentUser) {
        const savedLogin = localStorage.getItem("platformLogin");
        if (emailDisplay) emailDisplay.textContent = savedLogin || 'Аккаунт';
    } else {
        if (emailDisplay) emailDisplay.textContent = 'Гость';
    }
    updateProgressStats();
}

function showAccountModal(action) {
    const modal = document.getElementById('confirm-modal');
    const modalIcon = document.getElementById('modal-icon-container');
    const modalTitle = document.getElementById('modal-title');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');

    if (action === 'logout') {
        modalIcon.className = 'modal-icon-container purple';
        modalIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`;
        modalTitle.textContent = 'Выйти из аккаунта?';
        modalConfirmBtn.className = 'modal-btn-confirm purple';
        modalConfirmBtn.textContent = 'Да, выйти';
        modalConfirmBtn.onclick = () => {
            if (window.firebaseAuth) {
                import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js").then(({ signOut }) => {
                    signOut(window.firebaseAuth).then(() => {
                        modal.classList.add('hidden');
                        showToast('Вы успешно вышли из аккаунта');
                        navigateToMenuTab('topics');
                    });
                });
            }
        };
    } else if (action === 'delete') {
        modalIcon.className = 'modal-icon-container red';
        modalIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
        modalTitle.textContent = 'Удалить аккаунт без возможности восстановления?';
        modalConfirmBtn.className = 'modal-btn-confirm red';
        modalConfirmBtn.textContent = 'Да, удалить';
        modalConfirmBtn.onclick = async () => {
            if (!window.firebaseAuth || !window.firebaseAuth.currentUser) return;
            modalConfirmBtn.disabled = true;
            modalConfirmBtn.textContent = 'Удаление...';
            try {
                const idToken = await window.firebaseAuth.currentUser.getIdToken();
                const res = await fetch("https://d5dkes6tf8o0uff54egi.4b4k4pg5.apigw.yandexcloud.net/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "delete", idToken: idToken })
                });
                const data = await res.json();
                if (!res.ok) {
                    showToast(data.error || 'Не удалось удалить аккаунт');
                    modalConfirmBtn.disabled = false;
                    modalConfirmBtn.textContent = 'Да, удалить';
                    return;
                }
                localStorage.removeItem("platformLogin");
                modal.classList.add('hidden');
                showToast('Аккаунт удалён');
                navigateToMenuTab('topics');
            } catch (err) {
                showToast('Ошибка соединения с сервером');
                modalConfirmBtn.disabled = false;
                modalConfirmBtn.textContent = 'Да, удалить';
            }
        };
    }
    modal.classList.remove('hidden');
}

function renderProgressTable() {
    const container = document.getElementById('progress-table-container');
    if (!container) return;

    if (!COURSE_DATA || !COURSE_DATA.topics) {
        container.innerHTML = '<div style="text-align:center; padding: 20px; color: #9ca3af;">Темы не загружены</div>';
        return;
    }

    container.innerHTML = COURSE_DATA.topics.map(t => {
        // Вычисляем процент прохождения темы на основе userProgress
        let totalLessons = 0;
        let completedLessons = 0;

        t.subtopics.forEach(sub => {
    sub.levels.forEach(level => {
        const lessonId = typeof level === 'object' ? level.lessonId : level;

        totalLessons++;
        if (t.baseId && userProgress[t.baseId] && userProgress[t.baseId][lessonId] && userProgress[t.baseId][lessonId].completed) {
            completedLessons++;
        }
    });
});

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const isComplete = progress === 100 && totalLessons > 0;
        const meta = getRepetitionTopicMeta(t);

        return `
            <div class="table-row">
                <div class="row-top">
                    <div class="row-left">
                        <div class="row-icon-box ${isComplete ? 'complete' : 'incomplete'}">
                            ${getRepetitionIconSvg(meta.icon)}
                        </div>
                        <div class="row-titles">
                            <div class="title">${t.title}</div>
                            <div class="subtitle">${meta.subtitle}</div>
                        </div>
                    </div>
                    <div class="row-right">
                        <span class="progress-text ${isComplete ? 'complete' : 'incomplete'}">${progress}%</span>
                        ${isComplete ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="#eefce8" stroke="#58CC00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>` : ''}
                    </div>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${isComplete ? 'complete' : 'incomplete'}" style="width: ${progress}%">
                        <div class="specular-highlight"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const totalTasksElem = document.getElementById('total-tasks-count');
if (totalTasksElem) {
    let totalRegularLessons = 0;
    COURSE_DATA.topics.forEach(t => {
        t.subtopics.forEach(sub => {
            sub.levels.forEach(level => {
                totalRegularLessons++;
            });
        });
    });
    totalTasksElem.textContent = `${totalRegularLessons} уроков`;
}
}

function updateProgressStats() {
    if (!COURSE_DATA || !COURSE_DATA.topics) return;

    let totalLessons = 0;
    let completedLessons = 0;
    let masteredCount = 0;

    COURSE_DATA.topics.forEach(t => {
        let topicTotal = 0;
        let topicCompleted = 0;

        t.subtopics.forEach(sub => {
            sub.levels.forEach(level => {
                const lessonId = typeof level === 'object' ? level.lessonId : level;
                const lesson = COURSE_DATA.lessons[lessonId];
                const isRegularLesson = !(lesson && (lesson.isTest || lesson.isRepetition || lesson.isGenerator));
                
                if (isRegularLesson) {
                    totalLessons++;
                    topicTotal++;
                    if (t.baseId && userProgress[t.baseId] && userProgress[t.baseId][lessonId] && userProgress[t.baseId][lessonId].completed) {
                        completedLessons++;
                        topicCompleted++;
                    }
                }
            });
        });

        if (topicTotal > 0 && topicCompleted === topicTotal) {
            masteredCount++;
        }
    });

    const totalAvg = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const percentageElem = document.getElementById('overall-percentage');
    const badgeTextElem = document.getElementById('mastered-badge-text');

    if (percentageElem) percentageElem.textContent = `${totalAvg}%`;
    if (badgeTextElem) badgeTextElem.textContent = `${masteredCount} из ${COURSE_DATA.topics.length} освоено`;
}

function showToast(text) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = text;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2500);
              }

function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDailyQuestData() {
    try {
        return JSON.parse(localStorage.getItem('dailyQuests_' + getTodayKey())) || { lesson: 0, repetition: 0 };
    } catch (e) {
        return { lesson: 0, repetition: 0 };
    }
}

function saveDailyQuestData(data) {
    localStorage.setItem('dailyQuests_' + getTodayKey(), JSON.stringify(data));
}

function showDailyQuestsModal() {
    const data = getDailyQuestData();
    const quests = [
        {
            title: 'Пройти 1 урок в день',
            subtitle: 'Ежедневная цель',
            progress: data.lesson,
            target: 1,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
        },
        {
            title: 'Повторить одну тему',
            subtitle: 'На странице повторения',
            progress: data.repetition,
            target: 1,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>'
        }
    ];

    const container = document.getElementById('daily-quests-list');
    container.innerHTML = quests.map(q => {
        const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
        const isComplete = q.progress >= q.target;
        const startPct = getSavedQuestBarPct(q.title);
return `
        <div class="table-row">
            <div class="row-top">
                <div class="row-left">
                    <div class="row-icon-box ${isComplete ? 'complete' : 'incomplete'}">${q.icon}</div>
                    <div class="row-titles">
                        <div class="title">${q.title}</div>
                        <div class="subtitle">${q.subtitle}</div>
                    </div>
                </div>
                <div class="row-right">
                    <span class="progress-text ${isComplete ? 'complete' : 'incomplete'}">${pct}%</span>
                    ${isComplete ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="#eefce8" stroke="#58CC00" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>' : ''}
                </div>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill ${isComplete ? 'complete' : 'incomplete'}" style="width: ${startPct}%" data-pct="${pct}" data-title="${q.title}">
                    <div class="specular-highlight"></div>
                </div>
            </div>
        </div>`;
    }).join('');

    const overlay = document.getElementById('daily-quests-overlay');
    overlay.classList.remove('hidden');
    void overlay.offsetWidth;
    overlay.style.opacity = '1';
    document.getElementById('daily-quests-content').style.transform = 'scale(1)';

    setTimeout(() => {
        container.querySelectorAll('.progress-bar-fill').forEach(bar => {
            const finalPct = bar.getAttribute('data-pct');
            bar.style.width = finalPct + '%';
            saveQuestBarPct(bar.getAttribute('data-title'), finalPct);
        });
    }, 150);
}

function getSavedQuestBarPct(title) {
    try {
        const saved = JSON.parse(localStorage.getItem('dailyQuestsBarPct_' + getTodayKey())) || {};
        return saved[title] || 0;
    } catch (e) {
        return 0;
    }
}

function saveQuestBarPct(title, pct) {
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem('dailyQuestsBarPct_' + getTodayKey())) || {};
    } catch (e) {}
    saved[title] = pct;
    localStorage.setItem('dailyQuestsBarPct_' + getTodayKey(), JSON.stringify(saved));
}
function closeDailyQuestsModal() {
    const overlay = document.getElementById('daily-quests-overlay');
    const content = document.getElementById('daily-quests-content');
    overlay.style.opacity = '0';
    content.style.transform = 'scale(0.9)';
    setTimeout(() => {
        overlay.classList.add('hidden');
        if (currentAppState === 'lesson') {
            history.back();
        } else {
            actuallyCloseLesson();
        }
    }, 300);
                  }
