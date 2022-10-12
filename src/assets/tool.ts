import type { Song } from '@/store/types';

/**
 * @desc 根据 tags 返回过滤歌曲
 * @params songlist 歌单
 * @params disabledTags 只要歌曲中存在 disabledTags 中的任何tags，将会被剔除
 * @params includedTags 未被剔除的歌曲中，只要包含任意一个 includedTags，都会被返回
 */
export function filterSongWithTag(songlist: Song[], includedTags: string[] = [], disabledTags: string[] = []) {
    if (includedTags.length === 0) return songlist;
    return songlist.filter(song => {
        const hasDisabledTags = song.tags.filter((tag: string) => disabledTags.includes(tag))?.length > 0;
        if (hasDisabledTags) return false;
        const hasIncludedTags = song.tags.filter((tag: string) => includedTags.includes(tag))?.length > 0;
        return hasIncludedTags
    })
}

/**
 * @desc 根据 tags 返回过滤歌曲（强校验）
 * @params songlist 歌单
 * @params disabledTags 只要歌曲中存在 disabledTags 中的任何tags，将会被剔除
 * @params includedTags 未被剔除的歌曲中，只有包含所有的 includedTags，才会被返回
 */
 export function filterSongWithFullTag(songlist: Song[], includedTags: string[] = [], disabledTags: string[] = []) {
    if (includedTags.length === 0) return songlist;
    return songlist.filter(song => {
        const hasDisabledTags = song.tags.filter((tag: string) => disabledTags.includes(tag))?.length > 0;
        if (hasDisabledTags) return false;
        const hasFullIncludedTags = song.tags.filter((tag: string) => includedTags.includes(tag))?.length === includedTags.length;
        return hasFullIncludedTags
    })
}