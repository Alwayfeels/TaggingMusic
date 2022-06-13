import { h, getCurrentInstance } from 'vue'
import { NAvatar, NTag } from 'naive-ui'
import TagInput from '@/components/TagInput.vue'


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
                        class: 'img40'
                    }
                )
            }
        },
        {
            title: "artist",
            render(row) {
                return h(
                    'div',
                    {},
                    row.ar.map(artist => {
                        return h(
                            NTag,
                            {
                                class: 'mr-2'
                            },
                            artist.name
                        )
                    })
                )
            }
        },
        {
            title: 'tag',
            width: '600px',
            render(row, index) {
                return h(TagInput, {
                    songId: row.id
                })
            }
        }
    ]
}