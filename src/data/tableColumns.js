import { h, getCurrentInstance } from 'vue'
import { NAvatar, NTag } from 'naive-ui'
import TagInput from '@/components/TagInput.vue'
import { usePlayerStore } from '@/store/player';

const globalPlayer = usePlayerStore()

export function getSongTableColumns(tableInstance, tableData) {
    return [
        {
            title: "歌曲名称",
            key: "name",
            minWidth: '200px',
        },
        {
            title: "封面",
            key: "al.picUrl",
            minWidth: '50px',
            render(row) {
                let songImgUrl = `${row.al.picUrl}?param=40y40`
                return h(
                    NAvatar,
                    {
                        src: songImgUrl,
                        class: 'img40',
                    }
                )
            }
        },
        {
            title: "歌手",
            minWidth: '200px',
            render(row) {
                // const tags = row.ar.map(artist => {
                //     return h(NTag, { class: 'mr-2 play-point' }, { default: () => artist.name })
                // })
                return row.ar.map(artist => artist.name).join(' / ')
            }
        },
        {
            title: "专辑",
            width: '150px',
            render(row) {
                return h(
                    'div',
                    {},
                    row.al.name
                )
            }
        },
        {
            title: 'Tag',
            minWidth: '300px',
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
