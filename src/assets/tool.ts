import type { Song } from '@/store/types';

/**
 * @desc 根据 tags 返回过滤歌曲
 * @params songlist 歌单 Song[]
 * @params disabledTags: 对于 songlist[?].tags 中, 存在 disabledTags 中的任何tags，将会被剔除
 * @params requiredTags: 对于 songlist[?].tags 中，只要包含任意所有的 requiredTags，才会被返回
 * @params includedTags: 对于 songlist[?].tags 中，只要包含任意一个 includedTags，就会被返回
 */
export function filterSongWithTag(songlist: Song[], includedTags: string[] = [], requiredTags: string[] = [], disabledTags: string[] = []) {
    if (includedTags.length === 0) return [];
    let filteredSongs = filterIncludedTags(songlist, includedTags);
    if (disabledTags.length) {
        filteredSongs = filterDisabledTags(filteredSongs, disabledTags);
    }
    if (requiredTags.length) {
        filteredSongs = filterRequiredTags(filteredSongs, requiredTags);
    }
    return filteredSongs
}

/**
 * 根据 tags 返回过滤歌曲 disabled
 * @desc song.tags 不能含有任何 disabledTags 中的tags，否则将会被剔除
 */
function filterDisabledTags(songlist: Song[], disabledTags: string[] = []) {
    if (disabledTags.length === 0) return songlist;
    return songlist.filter(song => {
        const isDisabledSong = song.tags.find((tag: string) => {
            const hasDisabledTag = disabledTags.includes(tag)
            return hasDisabledTag
        })
        return !isDisabledSong;
    })
}

/**
 * 根据 tags 返回过滤歌曲 required
 * @desc song.tags 必须全部包含 requiredTags，否则将会被剔除
 */
function filterRequiredTags(songlist: Song[], requiredTags: string[] = []) {
    if (requiredTags.length === 0) return songlist;
    return songlist.filter(song => {
        const hasAllRequiredTags = new Set([...song.tags, ...requiredTags]).size === song.tags.length
        return hasAllRequiredTags;
    })
}

/**
 * 根据 tags 返回过滤歌曲 included
 * @desc: song.tags 中只要含有任何 includedTags 中的tags，就会被返回
 */
function filterIncludedTags(songlist: Song[], includedTags: string[] = []) {
    if (includedTags.length === 0) return [];
    return songlist.filter(song => {
        const isIncludedSong = song.tags.find((tag: string) => {
            const hasIncludedTags = includedTags.includes(tag)
            return hasIncludedTags
        })
        return isIncludedSong;
    })
}