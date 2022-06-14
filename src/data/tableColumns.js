import { h, getCurrentInstance } from 'vue'
import { NAvatar, NTag } from 'naive-ui'
import TagInput from '@/components/TagInput.vue'
import { usePlayerStore } from '@/store/player';

const globalPlayer = usePlayerStore()

export function getSongTableColumns(tableInstance, tableData) {
    return [
        {
            title: "name",
            key: "name",
        },
        {
            title: "avatar",
            key: "al.picUrl",
            render(row) {
                let songImgUrl = `${row.al.picUrl}?param=40y40`
                return h(
                    NAvatar,
                    {
                        src: songImgUrl,
                        class: 'img40 cursor-pointer',
                        onclick: () => {
                            globalPlayer.isPlayerShow = true;
                            globalPlayer.setCurrentSong(row)
                        }
                    }
                )
            }
        },
        {
            title: "artist",
            render(row) {
                const tags = row.ar.map(artist => {
                    return h(NTag, { class: 'mr-2 play-point' }, { default: () => artist.name })
                })
                return tags
            }
        },
        {
            title: "album",
            render(row) {
                return h(
                    'div',
                    {},
                    row.al.name
                )
            }
        },
        {
            title: 'tag',
            width: '600px',
            render(row, index) {
                return h(TagInput, {
                    songId: row.id,
                    songInfo: {
                        name: row.name,
                        artist: row.ar.map(artist => artist.name).join(' / '),
                        album: row.al.name
                    }
                })
            }
        }
    ]
}
