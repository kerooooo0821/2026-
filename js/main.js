(() => {
  'use strict';

  const works = Array.isArray(window.WORKS) ? window.WORKS : [];
  const homeView = document.getElementById('home-view');
  const skipLink = document.getElementById('skip-link');
  const siteHeader = document.getElementById('site-header');
  const siteFooter = document.getElementById('site-footer');
  const detailView = document.getElementById('detail-view');
  const detailPage = document.getElementById('detail-page');
  const detailBottomFade = document.getElementById('detail-bottom-fade');
  const detailBottomNav = document.getElementById('detail-bottom-nav');
  const grid = document.getElementById('works-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let homeScrollY = 0;
  let currentWorkId = null;
  let routeVersion = 0;
  let exitTimer = 0;
  let categoryDisplay = null;
  let currentCategoryLabel = '';
  let categoryTimer = 0;
  let categoryFramePending = false;
  let detailRevealObserver = null;
  let activeVideo = null;
  let activeVideoObserver = null;
  let videoFade = null;
  let activeCover = null;
  let lastDetailScrollTop = 0;
  let coverAdvanceTimer = 0;
  let coverFlipFrame = 0;
  let coverFlipping = false;
  let coverWheelAmount = 0;
  let coverWheelDirection = 0;
  let coverLastWheelAt = -Infinity;
  let coverQuietUntil = 0;
  let coverTouch = null;
  let lightboxOpener = null;
  let detailOpener = null;
  let touchStart = null;

  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function flipCover(toContent) {
    if (!activeCover || coverFlipping) return;
    coverFlipping = true;
    activeCover.classList.toggle('is-scrolled', toContent);
    const cover = activeCover;
    const animate = () => {
      coverAdvanceTimer = 0;
      if (activeCover !== cover) return;
      const start = detailPage.scrollTop;
      const target = toContent ? cover.offsetHeight : 0;
      if (reducedMotion.matches) {
        detailPage.scrollTo({ top: target, behavior: 'auto' });
        coverFlipping = false;
        return;
      }
      let beganAt = null;
      const step = (time) => {
        if (beganAt === null) beganAt = time;
        const progress = Math.min(1, (time - beganAt) / 900);
        const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        detailPage.scrollTo({ top: start + (target - start) * eased, behavior: 'auto' });
        if (progress < 1) { coverFlipFrame = requestAnimationFrame(step); return; }
        detailPage.scrollTo({ top: target, behavior: 'auto' });
        coverFlipFrame = 0;
        coverFlipping = false;
        coverQuietUntil = performance.now() + 350;
      };
      coverFlipFrame = requestAnimationFrame(step);
    };
    if (toContent && !reducedMotion.matches) coverAdvanceTimer = setTimeout(animate, 300);
    else animate();
  }

  function renderCards() {
    grid.innerHTML = works.map((work) => {
      const isPlaceholder = !work.thumb;
      const tags = Array.isArray(work.tags) ? work.tags : [];
      const image = isPlaceholder
        ? `<span class="work-placeholder-title">${safe(work.title)}</span>`
        : `<img class="work-thumb" src="${safe(work.thumb)}" alt="${safe(work.title)} 项目缩略图" loading="lazy">`;
      const icon = work.icon
        ? `<img class="work-overlay-icon" src="${safe(work.icon)}" alt="" loading="lazy">`
        : '';
      const tagMarkup = tags.length
        ? tags.map((tag) => `<span>${safe(tag)}</span>`).join('')
        : '<span>素材筹备中</span>';

      return `<a class="work-card" href="#work/${encodeURIComponent(work.id)}" aria-label="查看 ${safe(work.title)} 项目详情">
        <div class="work-image${isPlaceholder ? ' work-placeholder' : ''}">
          ${image}
          <div class="work-overlay" aria-hidden="true">
            <div class="work-overlay-content">
              ${icon}
              <div class="work-overlay-tags">${tagMarkup}</div>
              <strong class="work-overlay-title">${safe(work.title)}</strong>
            </div>
          </div>
        </div>
        <div class="work-info"><h3>${safe(work.title)}</h3></div>
      </a>`;
    }).join('');
  }

  function renderMediaItem(item) {
    if (item.type === 'image-set') {
      return `<div class="media-image-set" role="group" aria-label="${safe(item.id)}">
        <div class="media-image-set-grid${item.items.length === 1 ? ' is-single' : ''}">${item.items.map(renderMediaItem).join('')}</div>
      </div>`;
    }
    if (item.type === 'gameplay-set') {
      return `<div class="gameplay-set" role="group" aria-label="玩法 ${safe(item.id)}">
        <p class="gameplay-set-caption detail-reveal">${safe(item.caption)}</p>
        <div class="gameplay-set-grid${item.items.length === 1 ? ' is-single' : ''}">${item.items.map(renderMediaItem).join('')}</div>
      </div>`;
    }
    if (item.type === 'set') {
      const solo = item.items.filter((image) => image.role === 'solo');
      const team = item.items.filter((image) => image.role === 'team');
      const other = item.items.filter((image) => image.role !== 'solo' && image.role !== 'team');
      return `<div class="media-set" role="group" aria-label="商店图 ${safe(item.id)} 完整套装">
        <div class="media-set-solo">${solo.map(renderMediaItem).join('')}</div>
        <div class="media-set-team">${team.map(renderMediaItem).join('')}</div>
        ${other.length ? `<div class="media-set-other">${other.map(renderMediaItem).join('')}</div>` : ''}
      </div>`;
    }
    if (item.type === 'extras') {
      return `<div class="media-extras" role="group" aria-label="其他商店图">${item.items.map(renderMediaItem).join('')}</div>`;
    }
    const caption = safe(item.caption || '');
    if (item.type === 'video') {
      const poster = item.poster ? `<img src="${safe(item.poster)}" alt="${caption ? `${caption} 视频封面` : '视频封面'}" loading="lazy">` : '<span class="video-poster-missing">播放视频</span>';
      const loadingPoster = item.poster ? '<img class="video-loading-poster" alt="" loading="lazy" aria-hidden="true">' : '<span class="video-loading-poster" aria-hidden="true">视频加载中</span>';
      return `<figure class="media-item detail-reveal">
        <div class="video-stage">
          <button class="video-poster" type="button" data-video-src="${safe(item.src)}" aria-label="${caption ? `播放 ${caption}` : '播放视频'}">${poster}</button>
          <div class="video-player" hidden>
            ${loadingPoster}
            <span class="video-loading-indicator" aria-hidden="true"></span>
            <button class="video-collapse" type="button" data-video-close aria-label="收起视频">收起 ×</button>
            <video controls playsinline preload="none"${item.poster ? ` poster="${safe(item.poster)}"` : ''} aria-label="${caption || '项目视频'}"></video>
          </div>
        </div>
        ${caption ? `<figcaption class="video-caption">${caption}</figcaption>` : ''}
      </figure>`;
    }
    const credit = item.role === 'solo' ? '独立完成' : item.role === 'team' ? '团队制作' : '';
    const badge = item.role === 'team' ? '<span class="media-credit-badge is-team">团队制作</span>' : '';
    return `<figure class="media-item detail-reveal">
      <button class="media-image-button" type="button" data-image-src="${safe(item.src)}" data-caption="${caption}" aria-label="放大查看 ${caption || '项目图片'}${credit ? `，${credit}` : ''}">
        <img src="${safe(item.src)}" alt="${caption || '项目图片'}" loading="lazy">
      </button>
      ${badge}
      ${item.showCaption && caption ? `<figcaption class="video-caption image-caption">${caption}</figcaption>` : ''}
    </figure>`;
  }

  function renderDetail(work) {
    const sections = (work.sections || []).filter((section) => section.items.length > 0);
    const isPlaceholder = sections.length === 0;
    const coverCopy = work.coverCopy;
    const firstLabel = coverCopy ? '项目概览' : isPlaceholder ? '项目预览' : sections[0].key === 'videos' ? '视频' : sections[0].title;
    const workIndex = works.indexOf(work);
    const previous = works[(workIndex - 1 + works.length) % works.length];
    const next = works[(workIndex + 1) % works.length];
    detailView.innerHTML = `<article class="detail" aria-labelledby="detail-title">
      <div class="detail-topline section-shell"><a class="back-link" href="#works"><span aria-hidden="true">←</span> 返回作品</a><span class="detail-current-category" aria-live="polite">${safe(firstLabel)}</span><div class="detail-nav"><a href="#work/${encodeURIComponent(previous.id)}" aria-label="上一个项目">←</a><a href="#work/${encodeURIComponent(next.id)}" aria-label="下一个项目">→</a><button class="detail-close" type="button" aria-label="关闭项目详情">×</button></div></div>
      ${coverCopy ? `<section class="detail-hero" aria-label="项目概览，点击查看作品">
        <div class="detail-hero-copy">
          <h1 class="detail-hero-title" id="detail-title" tabindex="-1">${safe(coverCopy.title)}</h1>
          ${coverCopy.subtitle ? `<p class="detail-hero-subtitle">${safe(coverCopy.subtitle)}</p>` : ''}
          <div class="detail-hero-meta">
            <p class="detail-hero-intro"><span>${safe(coverCopy.intro)}</span>${coverCopy.keywords ? `<span>${safe(coverCopy.keywords)}</span>` : ''}</p>
          </div>
        </div>
      </section>` : ''}
      <div class="detail-content section-shell">
      ${coverCopy ? '' : `<h1 class="visually-hidden" id="detail-title" tabindex="-1">${safe(work.title)}</h1>`}
      ${isPlaceholder ? `<div class="detail-pending" role="status"><span class="detail-pending-index">${safe(work.id.toUpperCase())}</span><p>素材筹备中</p><span>这个项目的作品内容将在准备完成后更新。</span></div>` : ''}
      ${sections.map((section) => `<section class="media-section" aria-label="${safe(section.title)}" data-nav-label="${safe(section.key === 'videos' ? '视频' : section.title)}" data-section-key="${safe(section.key)}">
        <div class="media-list${section.items.some((item) => item.type === 'set') ? ' media-list--with-set' : ''}${section.items.some((item) => item.type === 'image-set') ? ' media-list--image-sets' : ''}${section.key === 'gameplay' ? ' media-list--gameplay' : ''}">${section.items.map((item) => renderMediaItem(item)).join('')}</div>
      </section>`).join('')}
      <div class="detail-end"><span>${isPlaceholder ? 'PROJECT PREVIEW' : 'END OF PROJECT'}</span><a class="text-link" href="#works">返回作品 <span aria-hidden="true">↗</span></a></div>
      </div>
    </article>`;
    detailBottomNav.innerHTML = sections.map((section, index) => `${index ? '<span class="detail-bottom-separator" aria-hidden="true">|</span>' : ''}<button type="button" data-detail-nav-key="${safe(section.key)}">${safe(section.key === 'videos' ? '视频' : section.title)}</button>`).join('');
    detailBottomNav.hidden = isPlaceholder;
    detailBottomNav.inert = true;
    detailBottomNav.setAttribute('aria-hidden', 'true');
  }

  function fitDetailImage(image) {
    if (!image.matches?.('.media-image-button img') || !image.naturalWidth || !image.naturalHeight) return;
    image.closest('.media-item')?.classList.toggle('is-portrait', image.naturalHeight > image.naturalWidth);
  }

  function cancelVideoFade() {
    if (!videoFade) return;
    const fade = videoFade;
    videoFade = null;
    if (fade.frame) cancelAnimationFrame(fade.frame);
    fade.video.volume = fade.originalVolume;
  }

  function fadeVideoOutAndPause(video) {
    if (video.paused || videoFade?.video === video) return;
    cancelVideoFade();
    if (video.muted || video.volume === 0) { video.pause(); return; }
    const fade = { video, originalVolume: video.volume, frame: 0, startedAt: null };
    videoFade = fade;
    const step = (time) => {
      if (videoFade !== fade) return;
      if (video.paused) { cancelVideoFade(); return; }
      if (fade.startedAt === null) fade.startedAt = time;
      const progress = Math.min(1, (time - fade.startedAt) / 350);
      video.volume = fade.originalVolume * (1 - progress);
      if (progress < 1) { fade.frame = requestAnimationFrame(step); return; }
      video.pause();
      video.volume = fade.originalVolume;
      videoFade = null;
    };
    fade.frame = requestAnimationFrame(step);
  }

  function collapseActiveVideo(restoreFocus = false) {
    if (!activeVideo) return;
    cancelVideoFade();
    activeVideoObserver?.disconnect();
    activeVideoObserver = null;
    const { button, player, video } = activeVideo;
    video.onloadedmetadata = video.onwaiting = video.onplaying = video.onpause = video.onended = video.onerror = null;
    video.pause();
    video.removeAttribute('src');
    video.load();
    player.hidden = true;
    player.classList.remove('is-loading', 'is-ready', 'is-buffering');
    player.style.width = '';
    player.style.height = '';
    player.style.aspectRatio = '';
    button.hidden = false;
    activeVideo = null;
    if (restoreFocus) button.focus();
  }

  function playVideoInCard(button) {
    collapseActiveVideo();
    const stage = button.closest('.video-stage');
    const player = stage.querySelector('.video-player');
    const video = player.querySelector('video');
    const poster = button.querySelector('img');
    const loadingPoster = player.querySelector('.video-loading-poster');
    if (poster && loadingPoster?.tagName === 'IMG') loadingPoster.src = poster.currentSrc || poster.src;
    const posterBounds = button.getBoundingClientRect();
    const stageWidth = stage.getBoundingClientRect().width || posterBounds.width || detailPage.clientWidth || window.innerWidth || 960;
    const viewportHeight = detailPage.clientHeight || window.innerHeight || 800;
    const maxHeight = viewportHeight * (window.matchMedia('(max-width: 640px)').matches ? .7 : .8);
    const previewWidth = Math.max(1, Math.min(posterBounds.width || stageWidth, stageWidth));
    const posterRatio = poster?.naturalWidth && poster?.naturalHeight ? poster.naturalWidth / poster.naturalHeight : 16 / 9;
    const previewHeight = Math.max(1, Math.min(posterBounds.height || previewWidth / posterRatio, maxHeight));
    player.style.width = `${previewWidth}px`;
    player.style.height = `${previewHeight}px`;
    player.style.aspectRatio = `${previewWidth} / ${previewHeight}`;
    player.classList.remove('is-ready', 'is-buffering');
    player.classList.add('is-loading');
    button.hidden = true;
    player.hidden = false;
    activeVideo = { button, stage, player, video };
    let playRequested = true;
    video.onwaiting = () => { if (activeVideo?.video === video) player.classList.add('is-buffering'); };
    video.onplaying = () => player.classList.remove('is-buffering');
    video.onpause = video.onended = () => player.classList.remove('is-buffering');
    video.onerror = () => { if (activeVideo?.video === video) collapseActiveVideo(); };
    video.onloadedmetadata = () => {
      if (activeVideo?.video !== video || !video.videoWidth || !video.videoHeight) return;
      const availableWidth = stage.getBoundingClientRect().width || stageWidth;
      const availableHeight = (detailPage.clientHeight || window.innerHeight || 800) * (window.matchMedia('(max-width: 640px)').matches ? .7 : .8);
      const scale = Math.min(1, availableWidth / video.videoWidth, availableHeight / video.videoHeight);
      const targetWidth = Math.max(1, Math.round(video.videoWidth * scale));
      const targetHeight = Math.max(1, Math.round(video.videoHeight * scale));
      player.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      player.style.width = `${targetWidth}px`;
      player.style.height = `${targetHeight}px`;
      player.classList.remove('is-loading');
      player.classList.add('is-ready');
      if (playRequested) player.classList.add('is-buffering');
      const currentVideo = activeVideo;
      setTimeout(() => { if (activeVideo === currentVideo) player.style.height = ''; }, 320);
    };
    video.src = button.dataset.videoSrc;
    if (typeof window.IntersectionObserver === 'function') {
      activeVideoObserver = new window.IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.target !== activeVideo?.player) continue;
          if (!entry.isIntersecting || entry.intersectionRatio < 1 / 3) fadeVideoOutAndPause(video);
          else if (videoFade?.video === video) cancelVideoFade();
        }
      }, { root: detailPage, threshold: [0, 1 / 3] });
      activeVideoObserver.observe(player);
    }
    video.play().catch(() => {
      playRequested = false;
      if (activeVideo?.video === video) player.classList.remove('is-buffering');
    });
  }

  function resetDetailReveals() {
    detailRevealObserver?.disconnect();
    detailRevealObserver = null;
    detailPage.classList.remove('has-reveal');
  }

  function setupDetailReveals() {
    if (reducedMotion.matches || typeof window.IntersectionObserver !== 'function') return;
    const targets = detailView.querySelectorAll('.detail-reveal');
    if (!targets.length) return;
    detailRevealObserver = new window.IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { root: detailPage, rootMargin: '0px 0px 80px 0px', threshold: 0.01 });
    targets.forEach((target, index) => {
      target.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
      detailRevealObserver.observe(target);
    });
    detailPage.classList.add('has-reveal');
  }

  function syncBottomNavigation() {
    const inWorks = Boolean(currentWorkId && !detailBottomNav.hidden
      && (!activeCover || detailPage.scrollTop >= activeCover.offsetHeight - 2));
    detailPage.classList.toggle('is-browsing-works', inWorks);
    detailBottomNav.inert = !inWorks;
    detailBottomNav.setAttribute('aria-hidden', String(!inWorks));
  }

  function jumpToSection(key) {
    const section = Array.from(detailView.querySelectorAll('.media-section')).find((entry) => entry.dataset.sectionKey === key);
    if (!section) return;
    if (coverAdvanceTimer) { clearTimeout(coverAdvanceTimer); coverAdvanceTimer = 0; }
    if (coverFlipFrame) { cancelAnimationFrame(coverFlipFrame); coverFlipFrame = 0; }
    const headerHeight = detailView.querySelector('.detail-topline')?.offsetHeight || 74;
    const start = detailPage.scrollTop;
    const unclamped = start + section.getBoundingClientRect().top - detailPage.getBoundingClientRect().top - headerHeight - 24;
    const target = Math.max(0, Math.min(unclamped, detailPage.scrollHeight - detailPage.clientHeight));
    activeCover?.classList.add('is-scrolled');
    coverFlipping = true;
    coverWheelAmount = 0;
    if (reducedMotion.matches || Math.abs(target - start) < 2) {
      detailPage.scrollTo({ top: target, behavior: 'auto' });
      coverFlipping = false;
      updateCurrentCategory();
      return;
    }
    let beganAt = null;
    const step = (time) => {
      if (beganAt === null) beganAt = time;
      const progress = Math.min(1, (time - beganAt) / 850);
      const eased = 1 - (1 - progress) ** 4;
      detailPage.scrollTo({ top: start + (target - start) * eased, behavior: 'auto' });
      if (progress < 1) { coverFlipFrame = requestAnimationFrame(step); return; }
      coverFlipFrame = 0;
      coverFlipping = false;
      coverQuietUntil = performance.now() + 350;
      updateCurrentCategory();
    };
    coverFlipFrame = requestAnimationFrame(step);
  }

  function setHomeInert(value) {
    homeView.inert = value;
    skipLink.inert = value;
    siteHeader.inert = value;
    siteFooter.inert = value;
    if (value) homeView.setAttribute('aria-hidden', 'true');
    else homeView.removeAttribute('aria-hidden');
  }

  function updateCurrentCategory() {
    if (!currentWorkId || !categoryDisplay) return;
    let label = activeCover && detailPage.scrollTop < activeCover.offsetHeight - detailPage.clientHeight * .25
      ? '项目概览' : '';
    let activeKey = '';
    if (!label) {
      const sections = detailView.querySelectorAll('.media-section');
      if (!sections.length) return;
      const marker = detailPage.clientHeight * .32;
      label = sections[0].dataset.navLabel;
      activeKey = sections[0].dataset.sectionKey;
      for (const section of sections) {
        if (section.getBoundingClientRect().top > marker) break;
        label = section.dataset.navLabel;
        activeKey = section.dataset.sectionKey;
      }
      if (detailPage.scrollTop + detailPage.clientHeight >= detailPage.scrollHeight - 3) {
        const lastSection = sections[sections.length - 1];
        label = lastSection.dataset.navLabel;
        activeKey = lastSection.dataset.sectionKey;
      }
    }
    detailBottomNav.querySelectorAll('[data-detail-nav-key]').forEach((button) => {
      const active = button.dataset.detailNavKey === activeKey;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
    if (label === currentCategoryLabel) return;
    currentCategoryLabel = label;
    if (categoryTimer) clearTimeout(categoryTimer);
    if (reducedMotion.matches) {
      categoryDisplay.textContent = label;
      categoryDisplay.classList.remove('is-changing');
      return;
    }
    categoryDisplay.classList.add('is-changing');
    categoryTimer = setTimeout(() => {
      categoryTimer = 0;
      if (!categoryDisplay || currentCategoryLabel !== label) return;
      categoryDisplay.textContent = label;
      categoryDisplay.classList.remove('is-changing');
    }, 150);
  }

  function route() {
    const version = ++routeVersion;
    resetDetailReveals();
    if (exitTimer) { clearTimeout(exitTimer); exitTimer = 0; }
    if (categoryTimer) { clearTimeout(categoryTimer); categoryTimer = 0; }
    if (coverAdvanceTimer) { clearTimeout(coverAdvanceTimer); coverAdvanceTimer = 0; }
    if (coverFlipFrame) { cancelAnimationFrame(coverFlipFrame); coverFlipFrame = 0; }
    coverFlipping = false;
    coverWheelAmount = 0;
    coverWheelDirection = 0;
    coverQuietUntil = 0;
    coverTouch = null;
    categoryDisplay = null;
    currentCategoryLabel = '';
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch { hash = ''; }
    const workId = hash.startsWith('work/') ? hash.slice(5) : null;
    const work = works.find((entry) => entry.id === workId);

    if (work) {
      if (!currentWorkId && !detailOpener && !document.body.classList.contains('detail-open')) homeScrollY = window.scrollY;
      if (lightbox.open) lightbox.close();
      collapseActiveVideo();
      renderDetail(work);
      detailView.querySelectorAll('.media-image-button img').forEach((image) => {
        if (image.complete) fitDetailImage(image);
      });
      const projectBg = /^#[0-9a-f]{6}$/i.test(work.bgColor || '') ? work.bgColor : '#13171e';
      detailPage.style.setProperty('--project-bg', projectBg);
      const projectFadeRgb = [1, 3, 5].map((index) => parseInt(projectBg.slice(index, index + 2), 16)).join(', ');
      detailBottomFade.style.setProperty('--project-fade-rgb', projectFadeRgb);
      categoryDisplay = detailView.querySelector('.detail-current-category');
      currentCategoryLabel = categoryDisplay?.textContent || '';
      activeCover = detailView.querySelector('.detail-hero');
      detailPage.scrollTop = 0;
      lastDetailScrollTop = 0;
      detailPage.classList.add('is-active');
      setupDetailReveals();
      detailPage.inert = false;
      detailPage.setAttribute('aria-hidden', 'false');
      setHomeInert(true);
      document.body.classList.add('detail-open');
      currentWorkId = work.id;
      document.title = `${work.title} — LIU`;
      syncBottomNavigation();
      updateCurrentCategory();
      requestAnimationFrame(() => {
        if (version === routeVersion) detailView.querySelector('#detail-title')?.focus?.({ preventScroll: true });
      });
      return;
    }

    const wasDetail = Boolean(currentWorkId);
    if (lightbox.open) lightbox.close();
    collapseActiveVideo();
    detailPage.classList.remove('is-active');
    detailPage.classList.remove('is-browsing-works');
    detailPage.inert = true;
    detailPage.setAttribute('aria-hidden', 'true');
    detailBottomNav.inert = true;
    detailBottomNav.setAttribute('aria-hidden', 'true');
    activeCover = null;
    lastDetailScrollTop = 0;
    currentWorkId = null;
    document.title = '刘颖 — 游戏视觉设计作品集';

    const finishExit = () => {
      if (version !== routeVersion) return;
      detailView.innerHTML = '';
      document.body.classList.remove('detail-open');
      setHomeInert(false);
      if (wasDetail && (hash === 'works' || hash === '')) {
        window.scrollTo(0, detailOpener ? homeScrollY : document.getElementById('works').offsetTop);
      } else if (hash) {
        document.getElementById(hash)?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
      if (wasDetail && detailOpener && detailOpener.isConnected) detailOpener.focus();
      detailOpener = null;
    };
    if (wasDetail && !reducedMotion.matches) exitTimer = setTimeout(finishExit, 600);
    else requestAnimationFrame(finishExit);
  }

  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.work-card');
    if (card) { homeScrollY = window.scrollY; detailOpener = card; }
  });

  detailView.addEventListener('click', (event) => {
    if (event.target.closest('.detail-close')) { location.hash = '#works'; return; }
    if (event.target.closest('[data-video-close]')) { collapseActiveVideo(true); return; }
    const imageButton = event.target.closest('[data-image-src]');
    if (imageButton) {
      lightboxOpener = imageButton;
      lightboxImage.src = imageButton.dataset.imageSrc;
      lightboxImage.alt = imageButton.dataset.caption;
      lightboxCaption.textContent = imageButton.dataset.caption;
      lightbox.showModal();
      document.body.classList.add('lightbox-open');
      return;
    }

    const videoButton = event.target.closest('[data-video-src]');
    if (videoButton) {
      playVideoInCard(videoButton);
      return;
    }
    if (event.target.closest('.detail-hero')) flipCover(true);
  });

  detailView.addEventListener('load', (event) => fitDetailImage(event.target), true);

  detailBottomNav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-detail-nav-key]');
    if (button && currentWorkId) jumpToSection(button.dataset.detailNavKey);
  });

  detailPage.addEventListener('wheel', (event) => {
    if (!activeCover || lightbox.open) return;
    if (coverFlipping) { event.preventDefault(); return; }
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? detailPage.clientHeight : 1);
    const direction = Math.sign(delta);
    const boundary = activeCover.offsetHeight;
    const top = detailPage.scrollTop;
    const atCover = direction > 0 && top < boundary - 2;
    const crossesBoundary = direction < 0 && top > boundary + 2 && top + delta <= boundary + 2;
    const atContentStart = direction < 0 && (Math.abs(top - boundary) <= 2 || crossesBoundary);
    if (!atCover && !atContentStart) { coverWheelAmount = 0; return; }
    event.preventDefault();
    if (crossesBoundary) detailPage.scrollTo({ top: boundary, behavior: 'auto' });
    const now = performance.now();
    if (now < coverQuietUntil) return;
    if (direction !== coverWheelDirection || now - coverLastWheelAt > 280) coverWheelAmount = 0;
    coverWheelDirection = direction;
    coverLastWheelAt = now;
    coverWheelAmount += Math.abs(delta);
    if (coverWheelAmount < 140) return;
    coverWheelAmount = 0;
    flipCover(direction > 0);
  }, { passive: false });

  detailPage.addEventListener('scroll', () => {
    if (activeCover) {
      const top = detailPage.scrollTop;
      const boundary = activeCover.offsetHeight;
      if (!coverFlipping && lastDetailScrollTop >= boundary - 2 && top < boundary - 2) {
        detailPage.scrollTop = boundary;
        lastDetailScrollTop = boundary;
      } else {
        if (coverAdvanceTimer && top >= 24) { clearTimeout(coverAdvanceTimer); coverAdvanceTimer = 0; }
        if (top <= 0) activeCover.classList.remove('is-scrolled');
        else if (top > lastDetailScrollTop && top >= 24) activeCover.classList.add('is-scrolled');
        else if (top < lastDetailScrollTop && top < activeCover.clientHeight * .75) activeCover.classList.remove('is-scrolled');
        lastDetailScrollTop = top;
      }
    }
    syncBottomNavigation();
    if (categoryFramePending) return;
    categoryFramePending = true;
    requestAnimationFrame(() => {
      categoryFramePending = false;
      updateCurrentCategory();
    });
  }, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (!currentWorkId || lightbox.open || event.target.closest?.('video')) return;
    if (event.key === 'Escape') { event.preventDefault(); location.hash = '#works'; return; }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = works.findIndex((entry) => entry.id === currentWorkId);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    location.hash = `#work/${encodeURIComponent(works[(index + step + works.length) % works.length].id)}`;
  });
  detailPage.addEventListener('touchstart', (event) => {
    if (event.changedTouches.length !== 1) return;
    const point = event.changedTouches[0];
    touchStart = { x: point.screenX, y: point.screenY };
    coverTouch = activeCover && detailPage.scrollTop <= activeCover.offsetHeight + 2
      ? { x: point.screenX, y: point.screenY, top: detailPage.scrollTop,
        startedAt: performance.now(), captured: false }
      : null;
  }, { passive: true });
  detailPage.addEventListener('touchmove', (event) => {
    if (coverFlipping) { event.preventDefault(); return; }
    if (!coverTouch || !activeCover || event.touches.length !== 1) return;
    const point = event.touches[0];
    const dx = point.screenX - coverTouch.x;
    const dy = point.screenY - coverTouch.y;
    if (Math.abs(dx) > Math.abs(dy) * 1.2) return;
    const boundary = activeCover.offsetHeight;
    const forward = coverTouch.top < boundary - 2 && dy < 0;
    const backward = coverTouch.top >= boundary - 2 && dy > 0;
    if (!forward && !backward) return;
    coverTouch.captured = true;
    event.preventDefault();
  }, { passive: false });
  detailPage.addEventListener('touchend', (event) => {
    if (coverTouch?.captured && activeCover) {
      const distance = coverTouch.y - event.changedTouches[0].screenY;
      const elapsed = Math.max(1, performance.now() - coverTouch.startedAt);
      const amount = Math.abs(distance);
      const deliberate = amount >= Math.max(120, detailPage.clientHeight * .18)
        && (amount / elapsed >= .15 || amount >= detailPage.clientHeight * .3);
      if (deliberate) flipCover(distance > 0);
      else detailPage.scrollTo({ top: coverTouch.top < activeCover.offsetHeight - 2 ? 0 : activeCover.offsetHeight, behavior: 'auto' });
      coverTouch = null;
      touchStart = null;
      return;
    }
    coverTouch = null;
    if (!touchStart || lightbox.open || !currentWorkId) return;
    const deltaX = event.changedTouches[0].screenX - touchStart.x;
    const deltaY = event.changedTouches[0].screenY - touchStart.y;
    touchStart = null;
    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
    const index = works.findIndex((entry) => entry.id === currentWorkId);
    const step = deltaX < 0 ? 1 : -1;
    location.hash = `#work/${encodeURIComponent(works[(index + step + works.length) % works.length].id)}`;
  }, { passive: true });
  detailPage.addEventListener('touchcancel', () => { coverTouch = null; touchStart = null; }, { passive: true });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lightboxImage.removeAttribute('src');
    lightboxOpener?.focus();
    lightboxOpener = null;
  });

  renderCards();
  window.addEventListener('hashchange', route);
  route();
})();
