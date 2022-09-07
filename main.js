const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'TH'
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playlist = $('.playlist')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('.progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    playedSong: [0],
    setting: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: '1 Phút',
            singer: 'Andiez',
            path: './assests/music/song1.mp3',
            image: './assests/img/song1.webp'
        },
        {
            name: 'Và Ngày Nào Đó',
            singer: 'Quang Trung',
            path: './assests/music/song2.mp3',
            image: './assests/img/song2.webp'
        },
        {
            name: 'Suýt Nữa Thì',
            singer: 'Andiez',
            path: './assests/music/song3.mp3',
            image: './assests/img/song3.webp'
        },
        {
            name: 'Người Ấy',
            singer: 'Trịnh Thăng Bình',
            path: './assests/music/song4.mp3',
            image: './assests/img/song4.webp'
        },
        {
            name: 'She Neva Knows',
            singer: 'JustaTee',
            path: './assests/music/song5.mp3',
            image: './assests/img/song5.webp'
        },
        {
            name: 'Crying Over You',
            singer: 'JustaTee, Binz',
            path: './assests/music/song6.mp3',
            image: './assests/img/song6.webp'
        },
        {
            name: 'Nơi Anh Không Thuộc Về',
            singer: '365DaBand',
            path: './assests/music/song7.mp3',
            image: './assests/img/song7.webp'
        }, {
            name: 'Vài Lần Đón Đưa',
            singer: 'SOOBIN, Touliver',
            path: './assests/music/song8.mp3',
            image: './assests/img/song8.webp'
        },
    ],

    setSetting: function (key, value) {
        this.setting[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(app.setting))
    },

    render: function () {
        const htmls = this.songs.map(function (song, index) {
            return `
            <div class="song ${index === app.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('')
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function () {
        const cdWidth = cd.offsetWidth
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        const cdThumbAnimate = cdThumb.animate(
            [{ transform: 'rotate(360deg)' }]
            , {
                duration: 10000,
                iterations: Infinity
            })

        cdThumbAnimate.pause()

        playBtn.onclick = function () {
            if (app.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        audio.onplay = function () {
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()

        }

        audio.onpause = function () {
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = (audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        progress.oninput = function (e) {
            const seekTime = e.target.value / 100 * audio.duration
            audio.currentTime = seekTime
        }

        nextBtn.onclick = function () {
            if (app.isRandom) {
                app.randomSong()
            } else {
                app.nextSong()
            }
            app.activeCurrentSong()
            app.randomSongNoRepeat()
            app.scrollToActiveSong()
            audio.play()
        }

        prevBtn.onclick = function () {
            if (app.isRandom) {
                app.randomSong()
            } else {
                app.prevSong()
            }
            app.activeCurrentSong()
            app.randomSongNoRepeat()
            app.scrollToActiveSong()
            audio.play()
        }

        randomBtn.onclick = function () {
            app.isRandom = !app.isRandom
            app.setSetting('isRandom', app.isRandom)
            randomBtn.classList.toggle("active", app.isRandom)
        }

        repeatBtn.onclick = function () {
            app.isRepeat = !app.isRepeat
            app.setSetting('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle("active", app.isRepeat)
        }

        audio.onended = function () {
            if (app.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                app.currentIndex = songNode.dataset.index
                app.loadCurrentSong()
                app.activeCurrentSong()
                audio.play()
            }
        }
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },

    loadConfig: function () {
        this.isRandom = this.setting.isRandom
        this.isRepeat = this.setting.isRepeat
        randomBtn.classList.toggle("active", app.isRandom)
        repeatBtn.classList.toggle("active", app.isRepeat)
    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex <= 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    randomSong: function () {
        var newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (app.playedSong.includes(newIndex))
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    activeCurrentSong: function () {
        const songList = $$('.song')
        if (songList[app.currentIndex].classList !== 'song active') {
            currentSongActive = $('.song.active')
            currentSongActive.classList.remove('active')
            songList[app.currentIndex].classList.add('active')
        }
    },

    randomSongNoRepeat: function () {
        app.playedSong.push(app.currentIndex)
        app.playedSong = [...new Set(app.playedSong)]
        if (app.playedSong.length === app.songs.length) {
            app.playedSong = []
        }
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest"
            })
        }, 500)
    },

    start: function () {
        this.loadConfig()
        this.defineProperties()
        this.handleEvents()
        this.loadCurrentSong()
        this.render()
    }
}

app.start()