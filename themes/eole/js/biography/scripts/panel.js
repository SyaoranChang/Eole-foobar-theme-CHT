﻿'use strict';

class Panel {
	constructor() {
		this.arc = 10;
		this.calc = true;
		this.calcText = false;
		this.clicked = false;
		this.clip = false;
		this.h = 0;
		this.lock = 0;
		this.lockHandle = null;

		this.m = {
			x: -1,
			y: -1
		}

		this.notifyTimestamp = Date.now();
		window.NotifyOthers(`bio_notServer${ppt.serverName}`, this.notifyTimestamp);
		this.tf = {};
		this.w = 0;

		this.alb = {
			cur: '',
			init: [],
			ix: 0,
			list: [],
			history: $.jsonParse(ppt.albumHistory, []),
			uniq: []
		}

		this.art = {
			cur: '',
			fields: cfg.artFields.map(v => '%' + v + '%'),
			history: $.jsonParse(ppt.artistHistory, []),
			init: [],
			ix: 0,
			list: [],
			similar: [],
			topAlbums: [],
			uniq: []
		}

		this.bor = {
			t: ppt.borL,
			r: ppt.borR,
			b: ppt.borB,
			l: ppt.borL
		}

		this.filmStripSize = {
			t: 0,
			r: 0,
			b: 0,
			l: 0
		}

		this.heading = {
			x: 0,
			w: 200
		}

		this.ibox = {
			l: 0,
			t: 0,
			w: 100,
			h: 100
		}

		this.id = {
			alb: '',
			curAlb: '',
			artist: '',
			curArtist: '',
			focus: ppt.focus,
			last_pressed_coord: {
				x: -1,
				y: -1
			},
			init: true,
			lockAlb: '',
			lockArt: '',
			loadTimestamp: Date.now(),
			lyricsSource: false,
			numServersChecked: false,
			tr: '',
			curTr: ''
		}

		for (let i = 0; i < 8; i++) {
			if (ppt.txtReaderEnable && ppt[`pthTxtReader${i}`] && ppt[`lyricsTxtReader${i}`]) {
				this.id.lyricsSource = true;
				this.id.focus = false;
				break;
			}
		}

		this.id.lookUp = ppt.lookUp;

		this.im = {
			t: 0,
			r: 100,
			b: 100,
			l: 0
		}

		this.img = {
			t: 0,
			r: 20,
			b: 0,
			l: 20
		}

		this.logo = {
			img: null
		}

		this.repaint = {
			x: 0,
			y: 0,
			w: 100,
			h: 100
		}

		this.sbar = {
			offset: 0,
			x: 0,
			y: 0,
			h: 100,
			style: !ppt.sbarFullHeight ? 2 : 0,
			top_corr: 0
		}

		this.style = {
			cycTimeItem: Math.max(ppt.cycTimeItem, 30),
			enlarged_img: false,
			free: $.jsonParse(ppt.styleFree, false),
			fullWidthHeading: ppt.heading && ppt.fullWidthHeading,
			gap: ppt.gap,
			imgSize: 0,
			inclTrackRev: ppt.inclTrackRev,
			max_y: 0,
			minH: 50,
			moreTags: false,
			name: [],
			new: false,
			overlay: $.jsonParse(ppt.styleOverlay, false),
			showFilmStrip: false
		}

		this.tbox = {
			l: 0,
			t: 0,
			w: 100,
			h: 100
		}

		this.text = {
			l: 20,
			t: 20,
			r: 20,
			w: 100,
			h: 100
		}

		this.trace = {
			film: false,
			image: false,
			text: false
		}

		this.tx = {
			t: 0,
			r: 100,
			b: 100,
			l: 0
		}

		this.setSummary();
		this.similarArtistsKey = 'Similar Artists: |\\u00c4hnliche K\\u00fcnstler: |Artistas Similares: |Artistes Similaires: |Artisti Simili: |\\u4f3c\\u3066\\u3044\\u308b\\u30a2\\u30fc\\u30c6\\u30a3\\u30b9\\u30c8: |Podobni Wykonawcy: |Artistas Parecidos: |\\u041f\\u043e\\u0445\\u043e\\u0436\\u0438\\u0435 \\u0438\\u0441\\u043f\\u043e\\u043b\\u043d\\u0438\\u0442\\u0435\\u043b\\u0438: |Liknande Artister: |Benzer Sanat\\u00e7\\u0131lar: |\\u76f8\\u4f3c\\u827a\\u672f\\u5bb6: '; this.d = parseFloat(this.q('0000029142')); this.lfm = this.q($.s);
		this.topAlbumsKey = 'Top Albums: |Top-Alben: |\\u00c1lbumes M\\u00e1s Escuchados: |Top Albums: |Album Pi\\u00f9 Ascoltati: |\\u4eba\\u6c17\\u30a2\\u30eb\\u30d0\\u30e0: |Najpopularniejsze Albumy: |\\u00c1lbuns Principais: |\\u041f\\u043e\\u043f\\u0443\\u043b\\u044f\\u0440\\u043d\\u044b\\u0435 \\u0430\\u043b\\u044c\\u0431\\u043e\\u043c\\u044b: |Toppalbum: |En Sevilen Alb\\u00fcmler: |\\u6700\\u4f73\\u4e13\\u8f91: ';

		this.focusLoad = $.debounce(() => {
			if (!ppt.img_only) txt.on_playback_new_track();
			if (!ppt.text_only || ui.style.isBlur || ppt.showFilmStrip) img.on_playback_new_track();
		}, 250, {
			'leading': true,
			'trailing': true
		});

		this.focusServer = $.debounce(() => {
			this.changed();
		}, 5000, {
			'leading': true,
			'trailing': true
		});

		this.lookUpServer = $.debounce(() => {
			this.callServer(false, panel.id.focus, 'bio_lookUpItem', 0);
		}, 1500);

		if (!this.style.free || !$.isArray(this.style.free)) {
			ppt.set('SYSTEM.Freestyle Custom BackUp', ppt.styleFree);
			this.style.free = [];
			ppt.styleFree = JSON.stringify(this.style.free);
			fb.ShowPopupMessage('Unable to load custom styles.\n\nThe save location was corrupt. Custom styles have been reset.\n\nThe original should be backed up to "SYSTEM.Freestyle Custom BackUp" in panel properties.', 'Biography');
		} else {
			let valid = true;
			this.style.free.forEach(v => {
				if (!$.objHasOwnProperty(v, 'name') || isNaN(v.imL) || isNaN(v.imR) || isNaN(v.imT) || isNaN(v.imB) || isNaN(v.txL) || isNaN(v.txR) || isNaN(v.txT) || isNaN(v.txB)) valid = false;
			});
			if (!valid) {
				ppt.set('SYSTEM.Freestyle Custom BackUp', ppt.styleFree);
				this.style.free = [];
				ppt.styleFree = JSON.stringify(this.style.free);
				fb.ShowPopupMessage('Unable to load custom styles.\n\nThe save location was corrupt. Custom styles have been reset.\n\nThe original should be backed up to "SYSTEM.Freestyle Custom BackUp" in panel properties.', 'Biography');
			}
		}
		if (!this.style.overlay || !$.objHasOwnProperty(this.style.overlay, 'name') || isNaN(this.style.overlay.imL) || isNaN(this.style.overlay.imR) || isNaN(this.style.overlay.imT) || isNaN(this.style.overlay.imB) || isNaN(this.style.overlay.txL) || isNaN(this.style.overlay.txR) || isNaN(this.style.overlay.txT) || isNaN(this.style.overlay.txB)) {
			ppt.set('SYSTEM.Overlay BackUp', ppt.styleOverlay);

			this.style.overlay = {
				'name': 'Overlay',
				'imL': 0,
				'imR': 0,
				'imT': 0,
				'imB': 0,
				'txL': 0,
				'txR': 0,
				'txT': 0.632,
				'txB': 0
			};

			ppt.styleOverlay = JSON.stringify(this.style.overlay);
			fb.ShowPopupMessage('Unable to load "SYSTEM.Overlay".\n\nThe save location was corrupt. The overlay style has been reset to default.\n\nThe original should be backed up to "SYSTEM.Overlay BackUp" in panel properties.', 'Biography');
		}

		this.getStyleNames();
	}

	// Methods

	albumsSame() {
		if (this.id.lookUp && this.alb.ix && this.alb.list.length && JSON.stringify(this.alb.init) === JSON.stringify(this.alb.list)) return true;
		return false;
	}

	artistsSame() {
		if (this.id.lookUp && this.art.ix && this.art.list.length && JSON.stringify(this.art.init) === JSON.stringify(this.art.list)) return true;
		return false;
	}

	block() {
		return this.w <= 10 || this.h <= 10 || !window.IsVisible;
	}

	callServer(force, focus, notify, type) {
		if (!this.id.numServersChecked) this.checkNumServers();
		switch (type) {
			case 0:
				if ($.server) server.download(force, {
					ix: this.art.ix,
					focus: focus,
					arr: this.art.list.slice(0)
				}, {
					ix: this.alb.ix,
					focus: focus,
					arr: this.alb.list.slice(0)
				}, notify);
				if (!$.server || ppt.multiServer) window.NotifyOthers(notify, [{
					ix: this.art.ix,
					focus: focus,
					arr: this.art.list.slice(0)
				}, {
					ix: this.alb.ix,
					focus: focus,
					arr: this.alb.list.slice(0)
				}]);
				break;
			case 1:
				server.download(force, {
					ix: this.art.ix,
					focus: focus,
					arr: this.art.list.slice(0)
				}, {
					ix: this.alb.ix,
					focus: focus,
					arr: this.alb.list.slice(0)
				});
				break;
		}
	}

	changed() {
		if (panel.id.focus || !fb.IsPlaying) this.callServer(false, panel.id.focus, 'bio_lookUpItem', 0);
		else if ($.server) this.callServer(false, panel.id.focus, '', 1);
	}

	checkNumServers() {
		ppt.multiServer = false;
		window.NotifyOthers('bio_checkNumServers', 0);
		this.id.numServersChecked = true;
	}

	changeView(x, y, menu) {
		if (!menu && (this.zoom() || x < 0 || y < 0 || x > this.w || y > this.h || but.Dn)) return false;
		if (!menu && !ppt.dblClickToggle && this.isTouchEvent(x, y)) return false;
		if (!menu && !ppt.img_only && (txt.scrollbar_type().onSbar && !txt.lyricsDisplayed())  || but.trace('heading', x, y) || but.trace('lookUp', x, y)) return false;
		return true;
	}

	checkFilm() {
		if (!ppt.showFilmStrip) return;
		const item = this.getItem();
		if (Date.now() - this.id.loadTimestamp > 1500) { // delay needed for correct sizing on init; ignored by click (sets loadTimestamp = 0); 
			switch (item) {
				case 'stndArtist':
					!this.id.lookUp ? txt.getText(true) : txt.getItem(true, this.art.ix, this.alb.ix);
					break;
				case 'stndAlbum':
					this.style.inclTrackRev != 1 || !this.id.lookUp ? txt.getText(true) : txt.getItem(true, this.art.ix, this.alb.ix);
					break;
				case 'lookUp':
					txt.getItem(true, this.art.ix, this.alb.ix);
					break;
			}
			but.refresh(true);
			txt.getScrollPos();
			txt.paint();
		}	
	}

	cleanPth(pth, item, type, artist, album, bio) {
		pth = pth.trim().replace(/\//g, '\\');
		if (pth.toLowerCase().includes('%profile%')) {
			let fbPth = fb.ProfilePath.replace(/'/g, "''").replace(/([()[\]%,])/g, "'$1'");
			if (fbPth.includes('$')) {
				const fbPthSplit = fbPth.split('$');
				fbPth = fbPthSplit.join("'$$'");
			}
			pth = pth.replace(/%profile%(\\|)/gi, fbPth);
		}
		switch (type) {
			case 'remap':
				pth = bio ? this.tfBio(pth, artist, item) : this.tfRev(pth, artist, album, item);
				break;
			case 'server':
				pth = $.eval(pth, item, true);
				break;
			case 'tag': {
				const tf_p = FbTitleFormat(pth);
				pth = tf_p.EvalWithMetadb(item);
				break;
			}
			default:
				pth = $.eval(pth, item);
				break;
		}
		if (!pth) return '';

		let UNC = pth.startsWith('\\\\');
		if (UNC) pth = pth.replace('\\\\', '');
		if (!pth.endsWith('\\')) pth += '\\';

		const c_pos = pth.indexOf(':');
		pth = type != 'lyr' ? 
			pth.replace(/[/|:]/g, '-').replace(/\*/g, 'x').replace(/"/g, "''").replace(/[<>]/g, '_').replace(/\?/g, '').replace(/\\\./g, '\\_').replace(/\.+\\/, '\\').replace(/\s*\\\s*/g, '\\') :
			pth.replace(/[/|:*"<>?]/g, '_');
		if (c_pos < 3 && c_pos != -1) pth = $.replaceAt(pth, c_pos, ':');

		while (pth.includes('\\\\')) pth = pth.replace(/\\\\/g, '\\_\\');
		if (UNC) pth = `\\\\${pth}`;
		return pth.trim();
	}

	click(x, y, menu) {
		this.clicked = this.changeView(x, y, menu);
		if (!this.clicked) return;
		this.id.loadTimestamp = 0;
		txt.logScrollPos();
		filmStrip.logScrollPos();
		ppt.toggle('artistView');
		img.resetTimestamps();
		const sameStyle = this.sameStyle();
		if (!sameStyle) this.setStyle();
		txt.na = '';
		timer.clear(timer.source);
		if (this.calc) this.calc = ppt.artistView ? 1 : 2;
		if (!this.lock && this.updateNeeded()) {
			this.getList(true, true);
			if (!ppt.artistView) txt.albumReset();
		}
		const item = this.getItem();
		switch (item) {
			case 'stndArtist':
				!this.id.lookUp ? txt.getText(this.calc) : txt.getItem(this.calc, this.art.ix, this.alb.ix);
				img.getImages();
				break;
			case 'stndAlbum':
				this.style.inclTrackRev != 1 || !this.id.lookUp ? txt.getText(this.calc) : txt.getItem(this.calc, this.art.ix, this.alb.ix);
				img.getImages();
				break;
			case 'lookUp':
				txt.getItem(this.calc, this.art.ix, this.alb.ix);
				img.getItem(this.art.ix, this.alb.ix);
				break;
		}
		if (ppt.img_only) img.setCrop(true);
		sameStyle & !ui.show.btnRedLastfm ? but.check() : but.refresh(true);
		if (!sameStyle && ppt.filmStripOverlay) filmStrip.set(ppt.filmStripPos);
		if (!ppt.artistView) img.setCheckArr(null);
		this.move(x, y, true);
		txt.getScrollPos();
		this.calc = false;
	}

	createStyle() {
		let ns;
		const ok_callback = (status, input) => {
			if (status != 'cancel') {
				ns = input;
			}
		}
		const caption = '創建新的自由風格版面';
		const prompt = '輸入新的樣式名稱\n\n自由的版面設定提供圖片和文字框的拖動式定位 + 文字疊加\n\n要繼續嗎?';
		const fallback = soFeatures.gecko && soFeatures.clipboard ? popUpBox.input(caption, prompt, ok_callback, '', '我的樣式') : true;
		if (fallback) {
			try {
				ns = utils.InputBox(0, prompt, caption, 'My Style', true);
			} catch(e) {
			}
		}
		if (!ns) return false;
		let lines_drawn, imgs, te_t;
		switch (ppt.style) {
			case 0: {
				let txt_h = Math.round((this.h - this.bor.t - ppt.textB) * (1 - ppt.rel_imgs));
				lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				txt_h = lines_drawn * ui.font.main_h + this.style.gap;
				imgs = Math.max(this.h - txt_h - this.bor.t - ppt.textB - ui.heading.h, 10);
				this.im.b = (this.h - this.bor.t - imgs - this.bor.b) / this.h;
				this.tx.t = (this.bor.t + imgs - ppt.textT + this.style.gap) / this.h;
				this.im.l = 0;
				this.im.r = 0;
				this.im.t = 0;
				this.tx.l = 0;
				this.tx.r = 0;
				this.tx.b = 0;
				break;
			}
			case 1: {
				const txt_sp = Math.round((this.w - ppt.textL - this.bor.r) * (1 - ppt.rel_imgs));
				lines_drawn = Math.max(Math.floor((this.h - ppt.textT - ppt.textB - ui.heading.h) / ui.font.main_h), 0);
				te_t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT - ppt.textB - lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h;
				this.im.l = (txt_sp + this.style.gap + (ppt.sbarShow ? ui.sbar.sp + 10 : 0)) / this.w;
				this.tx.r = (this.w - (txt_sp + ppt.textR)) / this.w;
				this.tx.t = (te_t - ui.heading.h - ppt.textT) / this.h;
				this.im.r = 0;
				this.im.t = 0;
				this.im.b = 0;
				this.tx.l = 0;
				this.tx.b = 0;
				break;
			}
			case 2: {
				let txt_h = Math.round((this.h - ppt.textT - this.bor.b) * (1 - ppt.rel_imgs));
				lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				txt_h = lines_drawn * ui.font.main_h + this.style.gap;
				imgs = Math.max(this.h - txt_h - this.bor.b - ppt.textT - ui.heading.h, 10);
				const img_t = this.h - this.bor.b - imgs;
				this.im.t = img_t / this.h;
				this.tx.b = (this.h - img_t - ppt.textB + this.style.gap) / this.h;
				this.im.l = 0;
				this.im.r = 0;
				this.im.b = 0;
				this.tx.l = 0;
				this.tx.r = 0;
				this.tx.t = 0;
				break;
			}
			case 3: {
				const te_r = ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + 10) : ppt.textR;
				const txt_sp = Math.round((this.w - this.bor.l - te_r) * (1 - ppt.rel_imgs));
				imgs = Math.max(this.w - txt_sp - this.bor.l - te_r - this.style.gap, 10);
				lines_drawn = Math.max(Math.floor((this.h - ppt.textT - ppt.textB - ui.heading.h) / ui.font.main_h), 0);
				te_t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT - ppt.textB - lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h;
				this.im.r = (this.w - this.bor.l - imgs - this.bor.r) / this.w;
				this.tx.l = (this.bor.l + imgs - ppt.textL + this.style.gap) / this.w;
				this.tx.t = (te_t - ui.heading.h - ppt.textT) / this.h;
				this.im.l = 0;
				this.im.t = 0;
				this.im.b = 0;
				this.tx.r = 0;
				this.tx.b = 0;
				break;
			}
		}
		this.style.free.forEach(v => {
			if (v.name == ns) ns = ns + ' New';
		});
		if (ppt.style > 3 && (ppt.img_only || ppt.text_only)) {
			if (ppt.style - 5 >= this.style.free.length) this.getStyleFallback();
			const obj = ppt.style == 4 ? this.style.overlay : this.style.free[ppt.style - 5];
			this.im.l = $.clamp(obj.imL, 0, 1);
			this.im.r = $.clamp(obj.imR, 0, 1);
			this.im.t = $.clamp(obj.imT, 0, 1);
			this.im.b = $.clamp(obj.imB, 0, 1);
			this.tx.l = $.clamp(obj.txL, 0, 1);
			this.tx.r = $.clamp(obj.txR, 0, 1);
			this.tx.t = $.clamp(obj.txT, 0, 1);
			this.tx.b = $.clamp(obj.txB, 0, 1);
		}
		this.style.free.push({
			'name': ns,
			'imL': this.im.l,
			'imR': this.im.r,
			'imT': this.im.t,
			'imB': this.im.b,
			'txL': this.tx.l,
			'txR': this.tx.r,
			'txT': this.tx.t,
			'txB': this.tx.b
		})
		this.sort(this.style.free, 'name');
		ppt.styleFree = JSON.stringify(this.style.free);
		this.style.free.some((v, i) => {
			if (v.name == ns) {
				if (ppt.sameStyle) ppt.style = i + 5;
				else if (ppt.artistView) ppt.bioStyle = i + 5;
				else ppt.revStyle = i + 5;
				return true;
			}
		})
		this.getStyleNames();
		txt.refresh(0);
		timer.clear(timer.source);
		timer.source.id = setTimeout(() => {
			this.style.new = false;
			window.Repaint();
			timer.source.id = null;
		}, 10000);
		if (timer.source.id !== 0) {
			this.style.new = true;
			window.Repaint();
		}
	}

	deleteStyle(n) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				this.style.free.splice(n - 5, 1);
				ppt.styleFree = JSON.stringify(this.style.free);
				ppt.style = 0;
				if (!ppt.sameStyle) {
					if (ppt.artistView) ppt.bioStyle = 0;
					else ppt.revStyle = 0;
				}
				this.getStyleNames();
				txt.refresh(0);
			}
		}
		const caption = '刪除當前的樣式';
		const prompt = '刪除: ' + this.style.name[n] + '\n\n樣式將設置為最上面的';
		const wsh = soFeatures.gecko && soFeatures.clipboard ? popUpBox.confirm(caption, prompt, '確定', '取消', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	draw(gr) {
		let font = ui.font.main;
		let str = 'POWERED by allmusic and last.fm.\r\n\r\nShift+middle click to activate / inactivate.';
		let textHeight2;
		
		const textHeight1 = Math.round(gr.MeasureString(str, font, 10, 0, this.w - 20, 1000, StringFormat(1, 1)).Height);
		const version = `  ${window.ScriptInfo.Name}: v${window.ScriptInfo.Version}`;
		const versionHeight = gr.CalcTextHeight(version, ui.font.small)
		const txtSp = this.h * 0.37;
		
		if (textHeight1 > txtSp) {
			str = str.replace('\r\n\r\n', ' ');
			textHeight2 = Math.round(gr.MeasureString(str, font, 10, 0, this.w - 20, 1000, StringFormat(1, 1)).Height);
			if (textHeight2 > txtSp) font = ui.font.small;
		}

		const textHeight3 = Math.round(gr.MeasureString(str, font, 10, 0, this.w - 20, 1000, StringFormat(1, 1)).Height);
		if (textHeight3 > txtSp) str = 'Shift+middle click to activate.';

		let textCol = ui.col.text;
		let textCol_h = ui.col.text_h;
		if (ppt.theme > 0) {
			textCol = ui.dui ? window.GetColourDUI(0) : window.GetColourCUI(0);
			textCol_h = ui.dui ? window.GetColourDUI(2) : window.GetColourCUI(2);
		}

		gr.SetInterpolationMode(7);
		if (this.logo.img) gr.DrawImage(this.logo.img, this.logo.x, Math.max(this.logo.y, versionHeight), this.logo.w, this.logo.h, 0, 0, this.logo.img.Width, this.logo.img.Height);
		gr.SetInterpolationMode(0);
		gr.GdiDrawText(version, ui.font.small, textCol_h, 0, 0, this.w, this.h, 0x00000800);
		gr.GdiDrawText(str, font, textCol, 10, this.h - txtSp, this.w - 20, txtSp, txt.ncc);
	}

	exportStyle(n) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				window.NotifyOthers('bio_customStyle', JSON.stringify(this.style.free[n - 5]));
			}
		}
		const caption = '將當前樣式匯出到其他人物介紹面板';
		const prompt = '匯出: ' + this.style.name[n];
		const wsh = soFeatures.gecko && soFeatures.clipboard ? popUpBox.confirm(caption, prompt, '確定', '取消', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	getItem() {
		if (!this.art.ix && ppt.artistView) return 'stndArtist';
		if (!this.alb.ix && !ppt.artistView) return 'stndAlbum';
		else return 'lookUp';
	}

	getList(p_clear, isAlbum) {
		if (!this.id.lookUp) return;
		const artist = name.artist(panel.id.focus, true) || 'Artist Unknown';
		const albumArtist = name.albumArtist(panel.id.focus, true) || 'Artist Unknown';
		const composition = isAlbum ? false : ppt.classicalMusicMode && txt.rev.loaded.am && !txt.rev.amFallback && !txt.rev.wikiFallback;
		const album = !composition ? name.album(panel.id.focus, true) || 'Album Unknown' : name.composition(panel.id.focus, true) || 'Composition Unknown';
		if (this.lock) {
			this.logArtistHistory(artist);
			this.logAlbumHistory(albumArtist, album, composition);
			return;
		}

		let k = 0;
		const lfmBio = this.cleanPth(cfg.pth.foLfmBio, panel.id.focus) + $.clean(artist) + cfg.suffix.foLfmBio + '.txt';
		const lBio = $.open(lfmBio);
		const lfmSim = this.cleanPth(cfg.pth.foLfmSim, panel.id.focus) + $.clean(artist) + ' And Similar Artists.json';
		const mult_arr = [];
		let mn = '';
		let nm = '';
		let sa = '';
		let ta = '';
		this.alb.init = this.alb.list.slice(0);
		this.alb.list = [];
		this.art.init = this.art.list.slice(0);
		this.art.list = [];
		this.art.list.push({
			name: artist,
			field: '',
			type: 'Artist'
		});
		if (ppt.showSimilarArtists) {
			if ($.file(lfmSim)) {
				const lSim = $.jsonParse(lfmSim, false, 'file');
				let newStyle = false;
				if (lSim) {
					if ($.objHasOwnProperty(lSim[0], 'name')) newStyle = true;
					lSim.shift();
					$.take(lSim, cfg.menuSimilarNum);
					if (lSim.length) {
						this.art.list.push({
							name: 'Similar Artists:',
							field: '',
							type: 'label'
						});
						lSim.forEach((v, i, arr) => this.art.list.push({
							name: newStyle ? v.name : v,
							field: '',
							type: i != arr.length - 1 ? 'similar' : 'similarend'
						}));
					}
				}
			} else {
				if ($.file(lfmBio)) {
					let found = false;
					sa = tag.getTag(lBio, this.similarArtistsKey).tag;
					if (sa.length < 7 && sa) {
						$.take(sa, cfg.menuSimilarNum);
						found = true;
					}
					if (!found) {
						this.art.similar.some(v => {
							if (v.name == artist) {
								sa = $.take(v.similar, cfg.menuSimilarNum);
								return found = true;
							}
						});
						if (!found) {
							const getSimilar = new LfmSimilarArtists(() => getSimilar.onStateChange(), this.getSimilar_search_done.bind(this));
							getSimilar.search(artist, '', '', 6);
						}
					}
					if (found && $.isArray(sa) && sa.length) {
						this.art.list.push({
							name: 'Similar Artists:',
							field: '',
							type: 'label'
						});
						sa.forEach((v, i) => this.art.list.push({
							name: v,
							field: '',
							type: i != sa.length - 1 ? 'similar' : 'similarend'
						}));
					}
				}
			}
		}

		if (ppt.showMoreTags) {
			this.style.moreTags = false;
			this.art.fields.forEach(v => {
				nm = v.replace(/%/g, '');
				for (let h = 0; h < $.eval('$meta_num(' + nm + ')', panel.id.focus); h++) {
					mn = '$trim($meta(' + nm + ',' + h + '))';
					const name = $.eval(mn, panel.id.focus);
					if (this.art.list.every(v => v.name !== name) && name.toLowerCase() != cfg.va.toLowerCase()) mult_arr.push({
						name: name,
						field: ' ~ ' + $.titlecase(nm),
						type: 'tag'
					});
				}
			});
			if (mult_arr.length > 1) {
				this.sort(mult_arr, 'name');
				k = mult_arr.length;
				while (k--)
					if (k != 0 && mult_arr[k].name.toLowerCase() == mult_arr[k - 1].name.toLowerCase()) {
						if (!mult_arr[k - 1].field.toLowerCase().includes(mult_arr[k].field.toLowerCase())) mult_arr[k - 1].field += mult_arr[k].field;
						mult_arr.splice(k, 1);
					}
			}
			if (mult_arr.length) {
				this.style.moreTags = true;
				this.art.list.push({
					name: 'More Tags:',
					field: '',
					type: 'label'
				});
				this.art.list = this.art.list.concat(mult_arr);
				this.art.list[this.art.list.length - 1].type = 'tagend';
			}
		}

		if (!artist || !this.art.cur || artist != this.art.cur) {
			this.logArtistHistory(artist);
			this.art.cur = artist;
		}

		if (!(albumArtist + album) || !this.alb.cur || albumArtist + album != this.alb.cur) {
			this.logAlbumHistory(albumArtist, album, composition);
			this.style.inclTrackRev = ppt.inclTrackRev;
			this.alb.cur = albumArtist + album;
		}

		if (this.art.history.length && ppt.showArtistHistory) {
			this.art.list.push({
				name: 'Artist History:',
				field: '',
				type: 'label'
			});
			for (let h = 0; h < this.art.history.length; h++)
				if (h || this.art.history[0].name != artist) this.art.list.push(this.art.history[h]);
			this.art.list[this.art.list.length - 1].type = 'historyend';
		}

		this.art.list.forEach((v, i) => v.ix = i);
		this.art.uniq = this.art.list.filter(v => v.type != 'label');

		if (ppt.showTopAlbums && $.file(lfmBio)) {
			let found = false;
			ta = tag.getTag(lBio, this.topAlbumsKey).tag;
			if (ta.length < 7 && ta) found = true;
			if (!found) {
				this.art.topAlbums.some(v => {
					if (v.name == artist) {
						ta = $.take(v.album, 6);
						return found = true;
					}
				});
				if (!found) {
					const getTopAlb = new LfmTopAlbums(() => getTopAlb.onStateChange(), this.getTopAlb_search_done.bind(this));
					getTopAlb.search(artist);
				}
			}
			this.alb.list = [];
			this.alb.list.push({
				artist: albumArtist,
				album: album,
				composition: composition,
				type: 'Current Album'
			});
			if (found && $.isArray(ta) && ta.length) {
				this.alb.list.push({
					artist: 'Last.fm Top Albums: ' + artist + ':',
					album: 'Last.fm Top Albums: ' + artist + ':',
					type: 'label'
				});
				ta.forEach((v, i) => this.alb.list.push({
					artist: artist,
					album: v,
					type: i != ta.length - 1 ? 'album' : 'albumend'
				}));
			}
		} else {
			this.alb.list = [];
			this.alb.list.push({
				artist: albumArtist,
				album: album,
				composition: composition,
				type: 'Current Album'
			});
		}

		if (this.alb.history.length && ppt.showAlbumHistory) {
			this.alb.list.push({
				artist: '',
				album: 'Album History:',
				type: 'label'
			});
			for (let h = 0; h < this.alb.history.length; h++) {
				if (h || this.alb.history[0].artist != albumArtist || this.alb.history[0].album != album)
					this.alb.list.push(this.alb.history[h]);
			}
			this.alb.list[this.alb.list.length - 1].type = 'historyend';
		}

		this.alb.list.forEach((v, i) => v.ix = i);
		this.alb.uniq = this.uniqAlbum(this.alb.list);
		if (!this.artistsSame() && p_clear) this.art.ix = 0;
		if (!this.albumsSame() && p_clear) this.alb.ix = 0;
	}

	getLogo() {
		this.logo.img = my_utils.getImageAsset('Logo.png');
		if (!this.logo.img) return;
		let scale = this.getScale(this.logo.img, this.w * Math.min(this.h * 0.8 / this.w, 0.9), this.h * 0.34);
		this.logo.w = scale[0];
		this.logo.h = scale[1];
		this.logo.x = (this.w - this.logo.w) / 2;
		this.logo.y = this.h * 0.05 + (this.h * 0.66 - this.logo.h) / 2;
	}

	getPth(sw, focus, artist, album, stnd, supCache, cleanArtist, cleanAlbumArtist, cleanAlbum, folder, basic, server) {
		let fo, pth;
		switch (sw) {
			case 'bio':
				if (stnd === '') stnd = this.stnd(this.art.ix, this.art.list);
				if (server) fo = stnd ? this.cleanPth(cfg.pth[folder], focus, 'server') : this.cleanPth(cfg.remap[folder], focus, 'remap', artist, '', 1);
				else fo = stnd && !this.lock ? this.cleanPth(cfg.pth[folder], focus) : this.cleanPth(cfg.remap[folder], focus, 'remap', artist, '', 1);
				pth = fo + cleanArtist + cfg.suffix[folder] + '.txt';
				if (!stnd && supCache && !$.file(pth)) fo = this.cleanPth(cfg.sup[folder], focus, 'remap', artist, '', 1);
				pth = fo + cleanArtist + cfg.suffix[folder] + '.txt';
				if (basic) return {
					fo: fo,
					pth: pth
				};
				else return [fo, pth, cleanArtist ? true : false, $.file(pth)];
			case 'rev':
				if (stnd === '') stnd = this.stnd(this.alb.ix, this.alb.list);
				if (!stnd) cleanAlbumArtist = cleanArtist;
				if (server) fo = stnd ? this.cleanPth(cfg.pth[folder], focus, 'server') : this.cleanPth(cfg.remap[folder], focus, 'remap', artist, album, 0);
				else fo = stnd && !this.lock ? this.cleanPth(cfg.pth[folder], focus) : this.cleanPth(cfg.remap[folder], focus, 'remap', artist, album, 0);
				pth = fo + cleanAlbumArtist + ' - ' + cleanAlbum + cfg.suffix[folder] + '.txt';
				if (!stnd && supCache && !$.file(pth)) fo = this.cleanPth(cfg.sup[folder], focus, 'remap', artist, album, 0);
				pth = fo + cleanAlbumArtist + ' - ' + cleanAlbum + cfg.suffix[folder] + '.txt';
				if (pth.length > 259) {
					cleanAlbum = $.abbreviate(cleanAlbum);
					pth = fo + cleanAlbumArtist + ' - ' + cleanAlbum + cfg.suffix[folder] + '.txt';
				}
				if (basic) return {
					fo: fo,
					pth: pth
				};
				else return [fo, pth, cleanAlbumArtist && cleanAlbum ? true : false, $.file(pth)];
			case 'track':
				fo = this.cleanPth(cfg.remap[folder], focus, 'remap', artist, album, 0);
				pth = fo + cleanArtist + ' - ' + cleanAlbum + cfg.suffix[folder].replace(' Review', '') + '.json';
				if (basic) return {
					fo: fo,
					pth: pth
				};
				else return [fo, pth, cleanArtist ? true : false, $.file(pth)];
			case 'cov':
				fo = this.cleanPth(cfg.pth.foImgCov, focus, 'server');
				pth = fo + $.clean($.eval(cfg.pth.fnImgCov, focus, true));
				return {
					fo: fo, pth: pth
				};
			case 'img': {
				fo = this.cleanPth(cfg.remap.foImgRev, focus, 'remap', artist, album, 0);
				let fn = $.clean(artist + ' - ' + album);
				pth = fo + fn;
				if (pth.length > 259) {
					album = $.abbreviate(album);
					fn = $.clean(artist + ' - ' + album);
					pth = fo + fn;
				}
				if (supCache === undefined) return {
					fo: fo,
					fn: fn,
					pth: pth
				};
				const pe = [fo];
				if (supCache) pe.push(this.cleanPth(cfg.sup.foImgRev, focus, 'remap', artist, album, 0));
				// fn long file path done above
				return {
					pe: pe,
					fe: fn
				}
			}
		}
	}

	getScale(image, w, h) {
		const sc = Math.min(h / image.Height, w / image.Width);
		return [Math.round(image.Width * sc), Math.round(image.Height * sc)];
	}

	getSimilar_search_done(artist, list) {
		this.art.similar.push({
			name: artist,
			similar: list
		});
		this.getList(true);
	}

	getStyleFallback() {
		ppt.style = 4;
		if (!ppt.sameStyle) {
			if (ppt.artistView) ppt.bioStyle = 4;
			else ppt.revStyle = 4;
		}
		fb.ShowPopupMessage('Unable to locate style. Using overlay layout instead.', 'Biography');
	}

	getTopAlb_search_done(artist, list) {
		this.art.topAlbums.push({
			name: artist,
			album: list
		});
		this.getList(true, true);
	}

	getStyleNames() {
		this.style.name = ['頂部', '右側', '底部', '左側', '疊加'];
		this.style.free.forEach(v => this.style.name.push(v.name));
	}

	isRadioFocused() {
		if (this.lock) return true;
		const fid = plman.ActivePlaylist.toString() + plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist).toString();
		const np = plman.GetPlayingItemLocation();
		let pid = -2;
		if (np.IsValid) pid = plman.PlayingPlaylist.toString() + np.PlaylistItemIndex.toString();
		return fid == pid;
	}

	imgBoxTrace(x, y) {
		if (this.trace.film || this.m.y == -1) return false;
		if (ppt.img_only) return true;
		if (ppt.style < 4) {
			switch (ppt.style) {
				case 0:
				case 2:
					return y > this.img.t && y < this.img.t + this.style.imgSize;
				case 1:
				case 3:
					return x > this.img.l && x < this.img.l + this.style.imgSize;
			}
		} else return y > this.ibox.t && y < this.ibox.t + this.ibox.h && x > this.ibox.l && x < this.ibox.l + this.ibox.w;
	}

	inactivate() {
		ppt.toggle('panelActive');
		window.NotifyOthers('bio_status', ppt.panelActive);
		window.Reload();
	}

	isRadio(focus) {
		return fb.IsPlaying && fb.PlaybackLength <= 0 && (!focus || this.isRadioFocused());
	}

	isTouchEvent(x, y) {
		return ppt.touchControl && Math.sqrt((Math.pow(this.id.last_pressed_coord.x - x, 2) + Math.pow(this.id.last_pressed_coord.y - y, 2))) > 3 * $.scale;
	}

	leave() {
		if (!ppt.autoEnlarge || men.right_up) return;
		if (ppt.img_only) {
			this.mode(0);
			this.style.enlarged_img = false;
		}
	}

	logAlbumHistory(albumArtist, album, composition) {
		if (albumArtist != 'Artist Unknown' && album != 'Album Unknown') this.alb.history.unshift({
			artist: albumArtist,
			album: album,
			composition: composition,
			type: 'history'
		});
		this.alb.history = this.uniqAlbum(this.alb.history);
		if (this.alb.history.length > 20) this.alb.history.length = 20;
		ppt.albumHistory = JSON.stringify(this.alb.history);
	}

	logArtistHistory(artist) {
		if (artist != 'Artist Unknown') this.art.history.unshift({
			name: artist,
			field: '',
			type: 'history'
		});
		this.art.history = this.uniqArtist(this.art.history);
		if (this.art.history.length > 20) this.art.history.length = 20;
		ppt.artistHistory = JSON.stringify(this.art.history);
	}

	mbtn_up(x, y, menuLock, bypass) {
		if ((x < 0 || y < 0 || x > this.w || y > this.h) && !bypass) return;
		if (this.id.lookUp && (but.btns['lookUp'].trace(x, y) || menuLock || bypass)) {
			if (panel.id.lyricsSource) {
				this.lock = 0;
				return;
			}
			let mArtist = ppt.artistView && this.art.ix;
			if (!this.lock && !mArtist) img.artistReset();
			if (!this.lock) {
				this.id.lockArt = $.eval(this.art.fields, panel.id.focus);
				this.id.lockAlb = name.albID(panel.id.focus, 'full') + (this.style.inclTrackRev ? name.trackID(panel.id.focus) : '');
				this.lockHandle = $.handle(panel.id.focus);
				img.setAlbID();
				img.cov.folder = panel.cleanPth(cfg.albCovFolder, panel.id.focus);
			}
			if (!bypass) this.lock = this.lock == 0 || menuLock ? 1 : 0;
			txt.curHeadingID = this.lock ? txt.headingID() : '';
			if (!this.lock && (ppt.artistView && this.id.lockArt != $.eval(this.art.fields, panel.id.focus) || !ppt.artistView && this.id.lockAlb != name.albID(panel.id.focus, 'full') + (this.style.inclTrackRev ? name.trackID(panel.id.focus) : ''))) {
				txt.on_playback_new_track(true);
				img.on_playback_new_track(true);
			}
			but.check();
			window.Repaint();
			return;
		}
		switch (true) {
			case ((ppt.img_only || ppt.text_only) && !this.trace.film):
				this.mode(0);
				break;
			case this.trace.image:
				this.mode(!ppt.img_only ? 1 : 2);
				break;
			case this.trace.text:
				this.mode(2);
				break;
		}
		this.move(x, y, true);
	}

	mode(n) {
		if (!ppt.sameStyle) ppt.artistView ? ppt.bioMode = n : ppt.revMode = n;
		let calcText = true;
		filmStrip.logScrollPos();
		switch (n) {
			case 0: {
				calcText = this.calcText || ppt.text_only;
				ppt.img_only = false;
				ppt.text_only = false;
				this.setStyle();
				img.clearCache();
				if (calcText && !ppt.sameStyle && (ppt.bioMode != ppt.revMode || ppt.bioStyle != ppt.revStyle)) calcText = ppt.artistView ? 1 : 2;
				if (!this.art.ix && ppt.artistView && !txt.bio.lookUp || !this.alb.ix && !ppt.artistView && !txt.rev.lookUp) {
					txt.albumReset();
					txt.artistReset();
					txt.getText(calcText);
					img.getImages();
				} else {
					txt.getItem(calcText, this.art.ix, this.alb.ix);
					img.getItem(this.art.ix, this.alb.ix);
				}
				break;
			}
			case 1:
				ppt.img_only = true;
				ppt.text_only = false;
				img.setCrop();
				this.setStyle();
				img.clearCache();
				img.getImages();
				break;
			case 2:
				ppt.img_only = false;
				ppt.text_only = true;
				this.setStyle();
				if (ui.style.isBlur) img.clearCache();
				if (!ppt.sameStyle && (ppt.bioMode != ppt.revMode || ppt.bioStyle != ppt.revStyle)) calcText = ppt.artistView ? 1 : 2;
				if (!this.art.ix && ppt.artistView && !txt.bio.lookUp || !this.alb.ix && !ppt.artistView && !txt.rev.lookUp) {
					txt.albumReset();
					txt.artistReset();
					txt.getText(calcText);
					if (ui.style.isBlur) img.getImages();
				} else {
					txt.getItem(calcText, this.art.ix, this.alb.ix);
					if (ui.style.isBlur) img.getItem(this.art.ix, this.alb.ix);
					img.setCheckArr(null);
				}
				break;
		}
		this.calcText = false;
		if (ppt.text_only) seeker.upd(true);
		if (ppt.filmStripOverlay) filmStrip.set(ppt.filmStripPos);
		but.refresh(true);
	}

	move(x, y, click) {
		this.trace.film = false;
		this.trace.text = false;
		this.trace.image = false;
		if (filmStrip.trace(x, y)) this.trace.film = true;
		else if (ppt.text_only) this.trace.text = true;
		else if (ppt.img_only) this.trace.text = false;
		else if (ppt.style < 4) {
			switch (ppt.style) {
				case 0:
					this.trace.text = y > this.img.t + this.style.imgSize;
					break;
				case 1:
					this.trace.text = x < this.w - this.style.imgSize - this.img.r;
					break;
				case 2:
					this.trace.text = y < this.img.t;
					break;
				case 3:
					this.trace.text = x > this.img.l + this.style.imgSize;
					break;
			}
		} else this.trace.text = y > this.tbox.t && y < this.tbox.t + this.tbox.h && x > this.tbox.l && x < this.tbox.l + this.tbox.w;
		if (!this.trace.text && !this.trace.film) this.trace.image = img.trace(x, y);
		if (!ppt.autoEnlarge || click || this.zoom() || seeker.dn) return;
		const enlarged_img_o = this.style.enlarged_img;
		this.style.enlarged_img = !this.trace.text && this.trace.image;
		if (this.style.enlarged_img && !ppt.text_only && !ppt.img_only && !enlarged_img_o) this.mode(1);
	}

	on_notify(info) {
		const rec = $.jsonParse(info, false);
		this.style.free.forEach(v => {
			if (v.name == rec.name) rec.name = rec.name + ' New';
		});
		this.style.free.push(rec);
		this.sort(this.style.free, 'name');
		ppt.styleFree = JSON.stringify(this.style.free);
		this.getStyleNames();
	}

	q(n) {
		return n.split('').reverse().join('');
	}

	renameStyle(n) {
		const ok_callback = (status, input) => {
			if (status != 'cancel') {
				if (!input || input == this.style.name[n]) return false;
				this.style.free.forEach(v => {
					if (v.name == input) input = input + ' New';
				});
				this.style.free[n - 5].name = input;
				this.sort(this.style.free, 'name');
				ppt.styleFree = JSON.stringify(this.style.free);
				this.style.free.some((v, i) => {
					if (v.name == input) {
						ppt.style = i + 5;
						return true;
					}
				});
				this.getStyleNames();
				window.Repaint();
			}
		}
		const caption = '重新命名當前的樣式';
		const prompt = '重新命名樣式: ' + this.style.name[n] + '\n\n輸入新的名稱\n\n要繼續嗎?';
		const fallback = soFeatures.gecko && soFeatures.clipboard ? popUpBox.input(caption, prompt, ok_callback, '', this.style.name[n]) : true;
		if (fallback) {
			let ns = '';
			let status = 'ok'
			try {
				ns = utils.InputBox(0, prompt, caption, this.style.name[n], true);
			} catch(e) {
				status = 'cancel'
			}
			ok_callback(status, ns);
		}
	}

	resetAlbumHistory() {
		this.alb.ix = 0;
		this.lock = 0;
		this.alb.history = [];
		ppt.albumHistory = JSON.stringify([]);
		this.alb.cur = '';
		this.getList(true, true);
	}

	resetArtistHistory() {
		this.art.ix = 0;
		this.lock = 0;
		this.art.history = [];
		ppt.artistHistory = JSON.stringify([]);
		this.art.cur = '';
		this.getList(true);
	}

	resetStyle(n) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				if (ppt.style < 4) ppt.rel_imgs = 0.65;
				else {
					const obj = ppt.style == 4 ? this.style.overlay : this.style.free[ppt.style - 5];
					obj.name = this.style.name[n];
					obj.imL = 0;
					obj.imR = 0;
					obj.imT = 0;
					obj.imB = 0;
					obj.txL = 0;
					obj.txR = 0;
					obj.txT = 0.632;
					obj.txB = 0;
					ppt.style == 4 ? ppt.styleOverlay = JSON.stringify(this.style.overlay) : ppt.styleFree = JSON.stringify(this.style.free);
				}
				txt.refresh(5);
			}
		}
		const caption = '重置當前的樣式';
		const prompt = '重置為預設 ' + (ppt.style < 4 ? this.style.name[n] : '重疊') + ' 樣式。\n\n要繼續嗎?'
		const wsh = soFeatures.gecko && soFeatures.clipboard ? popUpBox.confirm(caption, prompt, '確定', '取消', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	sameStyle() {
		return ppt.sameStyle || (ppt.bioMode == ppt.revMode && ppt.bioStyle == ppt.revStyle);
	}

	setBorder(imgFull, bor, refl) {
		if (imgFull) {
			const value = bor > 1 && !refl ? 10 * $.scale : 0;
			$.key.forEach(v => this.bor[v] = value);
		} else {
			$.key.forEach(v => this.bor[v] = bor < 2 || refl ? ppt[`bor${v.toUpperCase()}`] : Math.max(ppt[`bor${v.toUpperCase()}`], 10 * $.scale));
			this.style.gap = bor < 2 || refl ? ppt.gap : Math.max(ppt.gap, 10 * $.scale);
		}
	}

	setStyle(bypass) {
		this.sbar.offset = [2 + ui.sbar.arrowPad, Math.max(Math.floor(ui.sbar.but_w * 0.2), 2) + ui.sbar.arrowPad * 2, 0][ui.sbar.type];
		this.sbar.top_corr = [this.sbar.offset - (ui.sbar.but_h - ui.sbar.but_w) / 2, this.sbar.offset, 0][ui.sbar.type];
		const bot_corr = [(ui.sbar.but_h - ui.sbar.but_w) / 2 - this.sbar.offset, -this.sbar.offset, 0][ui.sbar.type];
		this.clip = false;
		if (!ppt.sameStyle) {
			switch (true) {
				case ppt.artistView:
					if (ppt.bioMode == 1) {
						ppt.img_only = true;
						ppt.text_only = false;
					} else if (ppt.bioMode == 2) {
						ppt.img_only = false;
						ppt.text_only = true;
					} else {
						ppt.img_only = false;
						ppt.text_only = false;
						ppt.style = ppt.bioStyle;
					}
					break;
				case !ppt.artistView:
					if (ppt.revMode == 1) {
						ppt.img_only = true;
						ppt.text_only = false;
					} else if (ppt.revMode == 2) {
						ppt.img_only = false;
						ppt.text_only = true;
					} else {
						ppt.img_only = false;
						ppt.text_only = false;
						ppt.style = ppt.revStyle;
					}
					break;
			}
			if (ppt.text_only) seeker.upd(true);
		}

		const sp1 = 10 * $.scale;
		const sp2 = sp1 + (this.filmStripSize.r && !ppt.filmStripOverlay ? 9 * $.scale : 0);

		switch (true) {
			case ppt.img_only: { // img_only
				$.key.forEach(v => this.img[v] = this.bor[v]);
				const autoFill = ppt.artistView && ppt.artStyleImgOnly == 1 || !ppt.artistView && ppt.covStyleImgOnly == 1;
				if (!autoFill && !ppt.filmStripOverlay) {
					const v = $.key[ppt.filmStripPos];
					this.img[v] += this.filmStripSize[v];
					this.style.imgSize = $.clamp(this.h - this.img.t - this.img.b, 10, this.w - this.img.l - this.img.r);
				} else this.style.imgSize = $.clamp(this.h - this.bor.t - this.bor.b, 10, this.w - this.bor.l - this.bor.r);
				break;
			}

			case ppt.text_only: // text_only
				this.lines_drawn = Math.max(Math.floor((this.h - ppt.textT - ppt.textB - ui.heading.h - this.filmStripSize.t - this.filmStripSize.b) / ui.font.main_h), 0);
				this.text.l = ppt.textL + this.filmStripSize.l;
				this.text.r = (ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + sp2) : ppt.textR) + this.filmStripSize.r;
				this.text.t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT + this.filmStripSize.t - ppt.textB - this.filmStripSize.b - this.lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h + this.filmStripSize.t;
				this.text.w = this.w - this.text.l - this.text.r;
				this.heading.x = !this.style.fullWidthHeading ? this.text.l : ppt.textL;
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - this.heading.x - ppt.textR;
				if (ppt.sbarShow) {
					if (!this.filmStripSize.r) this.sbar.x = this.w - ui.sbar.sp;
					else this.sbar.x = this.text.l + this.text.w + sp1;
					this.sbar.y = (ui.sbar.type < this.sbar.style || this.filmStripSize.t || this.filmStripSize.r || this.filmStripSize.b ? this.text.t : 0) + this.sbar.top_corr;
					this.sbar.h = (ui.sbar.type < this.sbar.style || this.filmStripSize.t || this.filmStripSize.r || this.filmStripSize.b ? ui.font.main_h * this.lines_drawn + bot_corr : this.h - this.sbar.y) + bot_corr;
				}
				this.repaint.x = this.text.l;
				this.repaint.y = 0;
				this.repaint.w = this.w - this.repaint.x - this.filmStripSize.r, this.repaint.h = this.h - this.filmStripSize.b;
				break;

			case ppt.style == 0: { // top
				$.key.forEach(v => this.img[v] = this.bor[v] + (v != 'b' ? (!ppt.filmStripOverlay ? this.filmStripSize[v] : 0) : 0));
				let txt_h = Math.round((this.h - this.img.t - ppt.textB - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0)) * (1 - ppt.rel_imgs));
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				txt_h = this.lines_drawn * ui.font.main_h + this.style.gap;
				this.style.imgSize = Math.max(this.h - txt_h - this.img.t - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0) - ppt.textB - ui.heading.h, 10);
				this.text.l = ppt.textL + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0);
				this.text.r = (ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + sp2) : ppt.textR) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.text.t = this.img.t + this.style.imgSize + this.style.gap + ui.heading.h;
				this.text.w = this.w - this.text.l - this.text.r;
				this.heading.x = (!this.style.fullWidthHeading ? this.text.l : ppt.textL);
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : panel.w - ppt.textL - ppt.textR;
				if (ppt.sbarShow) {
					if (!this.filmStripSize.r) this.sbar.x = this.w - ui.sbar.sp;
					else this.sbar.x = this.text.l + this.text.w + sp1;
					this.sbar.y = (ui.sbar.type < this.sbar.style || ppt.heading || this.filmStripSize.b ? this.text.t : this.img.t + this.style.imgSize) + this.sbar.top_corr;
					this.sbar.h = (ui.sbar.type < this.sbar.style || this.filmStripSize.b ? ui.font.main_h * this.lines_drawn + bot_corr : this.h - this.sbar.y) + bot_corr;
				}
				this.repaint.x = this.text.l;
				this.repaint.y = this.text.t;
				this.repaint.w = this.w - this.repaint.x - (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.repaint.h = this.h - this.repaint.y - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				break;
			}
			case ppt.style == 1: { // right
				$.key.forEach(v => this.img[v] = this.bor[v] + (v != 'l' ? (!ppt.filmStripOverlay ? this.filmStripSize[v] : 0) : 0));
				let txt_sp = Math.round((this.w - ppt.textL - (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) - this.img.r) * (1 - ppt.rel_imgs));
				let txt_h = this.h - ppt.textT - ppt.textB - (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				this.style.imgSize = Math.max(this.w - txt_sp - this.img.r - ppt.textL - (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) - this.style.gap, 10);
				if (ppt.sbarShow) txt_sp -= (ui.sbar.sp + sp1);
				this.text.l = ppt.textL + (!ppt.filmStripOverlay ? (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) : 0);
				this.text.r = ppt.sbarShow ? Math.max(ppt.textR + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0), ui.sbar.sp + sp1) : ppt.textR + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.text.t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT - ppt.textB + (!ppt.filmStripOverlay ? this.filmStripSize.t: 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0) - this.lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0);
				this.text.w = txt_sp;
				this.text.h = this.lines_drawn * ui.font.main_h;
				this.heading.x = !this.style.fullWidthHeading ? this.text.l : ppt.textL;
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - this.heading.x - this.bor.r;
				if (this.style.fullWidthHeading) this.img.t = this.text.t;
				this.img.l = ppt.textL + txt_sp + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) + this.style.gap + (ppt.sbarShow ? ui.sbar.sp + sp1 : 0);
				if (ppt.sbarShow) {
					this.sbar.x = this.text.l + this.text.w + sp1;
					this.sbar.y = (ui.sbar.type < this.sbar.style || ppt.heading || this.filmStripSize.t || this.filmStripSize.b ? this.text.t : 0) + this.sbar.top_corr;
					this.sbar.h = ui.sbar.type < this.sbar.style || this.filmStripSize.t || this.filmStripSize.b ? ui.font.main_h * this.lines_drawn + bot_corr * 2 : this.h - this.sbar.y + bot_corr;
				}
				this.repaint.x = this.text.l;
				this.repaint.y = this.text.t;
				this.repaint.w = this.img.l - this.repaint.x - this.style.gap;
				this.repaint.h = this.h - this.repaint.y - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				break;
			}

			case ppt.style == 2: { // bottom
				$.key.forEach(v => this.img[v] = this.bor[v] + (v != 't' && v != 'b' ? (!ppt.filmStripOverlay ? this.filmStripSize[v] : 0) : 0));
				let txt_h = Math.round((this.h - ppt.textT - this.img.b - (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0)) * (1 - ppt.rel_imgs));
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				txt_h = this.lines_drawn * ui.font.main_h + this.style.gap;
				this.style.imgSize = Math.max(this.h - txt_h - ppt.textT - this.img.b - (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0) - ui.heading.h, 10);
				this.img.t = this.h - this.bor.b - this.style.imgSize - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				this.text.l = ppt.textL + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0);
				this.text.r = (ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + sp2) : ppt.textR) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.text.t = this.img.t - txt_h;
				this.text.w = this.w - this.text.l - this.text.r;
				this.heading.x = (!this.style.fullWidthHeading ? this.text.l : ppt.textL);
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : panel.w - ppt.textL - ppt.textR;
				if (ppt.sbarShow) {
					if (!this.filmStripSize.r) this.sbar.x = this.w - ui.sbar.sp;
					else this.sbar.x = this.text.l + this.text.w + sp1;
					this.sbar.y = (ui.sbar.type < this.sbar.style || ppt.heading ? this.text.t : 0) + this.sbar.top_corr;
					this.sbar.h = ui.sbar.type < this.sbar.style ? ui.font.main_h * this.lines_drawn + bot_corr * 2 : this.img.t - this.sbar.y + bot_corr;
				}
				this.repaint.x = this.text.l;
				this.repaint.y = this.text.t;
				this.repaint.w = this.w - this.repaint.x - (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.repaint.h = this.img.t - this.repaint.y;
				break;
			}

			case ppt.style == 3: { // left
				$.key.forEach(v => this.img[v] = this.bor[v] + (v != 'r' ? (!ppt.filmStripOverlay ? this.filmStripSize[v] : 0) : 0));
				this.text.r = (ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + sp2) : ppt.textR) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				const txt_sp = Math.round((this.w - this.img.l - this.text.r) * (1 - ppt.rel_imgs));
				let txt_h = this.h - ppt.textT - ppt.textB - (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				this.style.imgSize = Math.max(this.w - txt_sp - this.img.l - this.text.r - this.style.gap, 10);
				this.text.l = this.img.l + this.style.imgSize + this.style.gap;
				this.text.t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT - ppt.textB + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0) - this.lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0);
				this.text.w = txt_sp;
				this.text.h = this.lines_drawn * ui.font.main_h;
				this.heading.x = !this.style.fullWidthHeading ? this.text.l : this.bor.l;
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - this.heading.x - ppt.textR;
				if (this.style.fullWidthHeading) this.img.t = this.text.t;
				if (ppt.sbarShow) {
					if (!this.filmStripSize.r) this.sbar.x = this.w - ui.sbar.sp;
					else this.sbar.x = this.text.l + this.text.w + sp1;
					this.sbar.y = (ui.sbar.type < this.sbar.style || ppt.heading || this.filmStripSize.t || this.filmStripSize.b ? this.text.t : 0) + this.sbar.top_corr;
					this.sbar.h = ui.sbar.type < this.sbar.style || this.filmStripSize.t || this.filmStripSize.b ? ui.font.main_h * this.lines_drawn + bot_corr * 2 : this.h - this.sbar.y + bot_corr;
				}
				this.repaint.x = this.text.l;
				this.repaint.y = this.text.t;
				this.repaint.w = this.w - this.repaint.x - (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.repaint.h = this.h - this.repaint.y - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				break;
			}

			case ppt.style > 3: {
				if (ppt.style - 5 >= this.style.free.length) this.getStyleFallback();
				const obj = ppt.style == 4 ? this.style.overlay : this.style.free[ppt.style - 5];
				if (!bypass) {
					this.im.l = $.clamp(obj.imL, 0, 1);
					this.im.r = $.clamp(obj.imR, 0, 1);
					this.im.t = $.clamp(obj.imT, 0, 1);
					this.im.b = $.clamp(obj.imB, 0, 1);
					this.tx.l = $.clamp(obj.txL, 0, 1);
					this.tx.r = $.clamp(obj.txR, 0, 1);
					this.tx.t = $.clamp(obj.txT, 0, 1);
					this.tx.b = $.clamp(obj.txB, 0, 1);
				}
				const imL = Math.round(this.im.l * this.w) + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0);
				const imR = Math.round(this.im.r * this.w) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				const imT = Math.round(this.im.t * this.h) + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0);
				const imB = Math.round(this.im.b * this.h) + (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				const txL = Math.round(this.tx.l * this.w) + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0);
				const txR = Math.round(this.tx.r * this.w) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				const txT = Math.round(this.tx.t * this.h) + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0);
				const txB = Math.round(this.tx.b * this.h) + (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				this.ibox.l = Math.max(imL, 0);
				this.ibox.t = Math.max(imT, 0);
				this.ibox.w = this.w - imL - imR;
				this.ibox.h = this.h - imT - imB;
				this.img.l = imL + this.bor.l;
				this.img.r = imR + this.bor.r;
				this.img.t = imT + this.bor.t;
				this.img.b = imB + this.bor.b;

				const t_l = ppt.textL + ui.overlay.borderWidth;
				const t_t = ppt.textT + ui.overlay.borderWidth;
				let t_r = ppt.textR + ui.overlay.borderWidth;
				let t_b = ppt.textB + ui.overlay.borderWidth;
				if (ppt.typeOverlay == 2 || ppt.typeOverlay == 4) {
					t_r += 1;
					t_b += 1;
				}

				let txt_h = Math.round((this.h - txT - txB - t_t - t_b));
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				this.text.l = txL + t_l;
				this.text.r = txR + (ppt.sbarShow ? Math.max(t_r, ui.sbar.sp + sp1) : t_r);
				this.text.t = txT + ui.heading.h + t_t;
				this.text.w = this.w - this.text.l - this.text.r;
				this.heading.x = !this.style.fullWidthHeading ? this.text.l : Math.min(this.img.l, this.text.l, (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) ? filmStrip.x : this.w);
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - this.heading.x - Math.min(this.img.r, this.text.r, (!ppt.filmStripOverlay ? this.filmStripSize.r : 0) ? this.w - filmStrip.x - filmStrip.w : this.w);
				this.tbox.l = Math.max(txL, 0);
				this.tbox.t = Math.max(txT, 0);
				this.tbox.w = this.w - Math.max(txL, 0) - Math.max(txR, 0);
				this.tbox.h = this.h - Math.max(txT, 0) - Math.max(txB, 0);
				this.style.minH = ui.font.main_h + ui.heading.h + t_t + t_b;
				if (ppt.typeOverlay == 2) ui.overlay.borderWidth = Math.max(Math.min(ui.overlay.borderWidth, this.tbox.w / 3, this.tbox.h / 3), 1);
				if (ppt.typeOverlay) this.arc = Math.max(Math.min(ui.font.main_h / 1.5, this.tbox.w / 3, this.tbox.h / 3), 1);
				this.clip = this.ibox.t + 100 < this.tbox.t && this.tbox.t < this.ibox.t + this.ibox.h && (this.tbox.l < this.ibox.l + this.ibox.w || this.tbox.l + this.tbox.w < this.ibox.l + this.ibox.w);
				this.style.imgSize = this.clip ? this.tbox.t - this.ibox.t : Math.min(this.h - imT - imB - this.bor.t - this.bor.b, this.w - imL - imR - this.bor.l - this.bor.r);
				if (ppt.sbarShow) {
					this.sbar.x = this.tbox.l + this.tbox.w - ui.sbar.sp - ui.overlay.borderWidth;
					this.sbar.y = this.text.t + this.sbar.top_corr;
					this.sbar.h = ui.font.main_h * this.lines_drawn + bot_corr * 2;
				}
				this.repaint.x = this.tbox.l;
				this.repaint.y = this.tbox.t;
				this.repaint.w = this.tbox.w;
				this.repaint.h = this.tbox.h;
				break;
			}
		}
		if (ui.sbar.type == 2) {
			this.sbar.y += 1;
			this.sbar.h -= 2;
		}
		this.text.w = Math.max(this.text.w, 10);
		this.style.max_y = this.lines_drawn * ui.font.main_h + this.text.t - ui.font.main_h * 0.9;
		if (!this.id.init) filmStrip.check();
		this.id.init = false;
	}

	setSummary() {
		this.summary = {
			date: ppt.summaryShow && ppt.summaryDate,
			genre: ppt.summaryShow && ppt.summaryGenre,
			latest: ppt.summaryShow && ppt.summaryLatest,
			locale: ppt.summaryShow && ppt.summaryLocale,
			other: ppt.summaryShow && ppt.summaryOther,
			popNow: ppt.summaryShow && ppt.summaryPopNow,
			show: ppt.summaryShow
		}
	}

	sort(data, prop) {
		data.sort((artist, b) => {
			artist = artist[prop].toLowerCase();
			b = b[prop].toLowerCase();
			return artist.localeCompare(b);
		});
		return data;
	}

	stnd(artist, b) {
		return !artist || artist + 1 > b.length;
	}

	simTagTopLookUp() {
		const li = ppt.artistView ? this.art : this.alb;
		return li.ix && li.list[li.ix] && li.list[li.ix].type != 'history';
	}

	stndItem() {
		return !this.art.ix && ppt.artistView || !this.alb.ix && !ppt.artistView;
	}

	tfBio(n, artist, focus) {
		n = n.replace(/((\$if|\$and|\$or|\$not|\$xor)(|\d)\(|\[)[^$%]*%bio_artist%/gi, '$&#@!%path%#@!').replace(/%bio_artist%/gi, $.tfEscape(artist)).replace(/%bio_album%/gi, this.tf.album).replace(/%bio_title%/gi, this.tf.title);
		n = $.eval(n, focus);
		n = n.replace(/#@!.*?#@!/g, '');
		return n;
	}

	tfRev(n, albumArtist, album, focus) {
		n = n.replace(/((\$if|\$and|\$or|\$not|\$xor)(|\d)\(|\[)[^$%]*(%bio_albumartist%|%bio_album%)/gi, '$&#@!%path%#@!').replace(/%bio_albumartist%/gi, $.tfEscape(albumArtist)).replace(/%bio_album%/gi, $.tfEscape(album)).replace(/%bio_title%/gi, this.tf.title);
		n = $.eval(n, focus);
		n = n.replace(/#@!.*?#@!/g, '');
		return n;
	}

	text_paint() {
		window.RepaintRect(this.repaint.x, this.repaint.y, this.repaint.w, this.repaint.h);
	}

	uniqAlbum(artist) {
		const flags = [];
		let result = [];
		artist.forEach(v => {
			const name = v.artist.toLowerCase() + ' - ' + v.album.toLowerCase();
			if (flags[name]) return;
			result.push(v);
			flags[name] = true;
		});
		return result = result.filter(v => v.type != 'label');
	}

	uniqArtist(artist) {
		const flags = [];
		let result = [];
		artist.forEach(v => {
			if (flags[v.name]) return;
			result.push(v);
			flags[v.name] = true;
		});
		return result;
	}

	updateNeeded() {
		switch (true) {
			case ppt.artistView:
				this.id.curArtist = this.id.artist;
				this.id.artist = $.eval(this.art.fields, panel.id.focus);
				if (!this.id.lookUp) return true;
				else return this.id.artist != this.id.curArtist || !this.art.list.length || !this.art.ix;
			case !ppt.artistView:
				this.id.curAlb = this.id.alb;
				this.id.alb = name.albID(panel.id.focus, 'simple');
				if (this.style.inclTrackRev) {
					this.id.curTr = this.id.tr;
					this.id.tr = name.trackID(panel.id.focus);
				} else this.id.curTr = this.id.tr = '';
				if (!this.id.lookUp) return true;
				else return this.id.alb != this.id.curAlb || this.id.tr != this.id.curTr || !this.alb.list.length || !this.alb.ix;
		}
	}

	zoom() {
		return vk.k('shift') || vk.k('ctrl');
	}
}
