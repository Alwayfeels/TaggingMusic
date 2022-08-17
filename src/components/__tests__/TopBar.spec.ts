import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import TopBar from '../TopBar.vue'
import { setActivePinia, createPinia } from 'pinia'
import { useGlobalData } from '@/store/globalData'
import { useGlobalState } from '@/store/globalState'
import {NIcon, NButton} from 'naive-ui'

/** 
 * @desc 
 * 
 * Naive UI 中的 notification 组件需要一个外部的 n-notification-provider 组件支持
 * 运行单元测试 会报错：Error: [naive/use-notification]: No outer `n-notification-provider` found.
 * 
 */

describe('TopBar', () => {
  beforeEach(() => {
    // creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia())
  })

  const wrapper = mount(TopBar, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
        }),
      ],
    },
  })
  const vm = wrapper.vm

  it('renders Logo', () => {
    expect(wrapper.text()).toContain('Tagging Music')
  })

  // 也便于检查已存在的元素
  it('has a Nbutton', () => {
    expect(wrapper.findComponent(NButton).exists()).toBe(true)
  })

  it('has a NIcon', () => {
    expect(wrapper.findComponent(NIcon).exists()).toBe(true)
  })

  // 可跳转
  // it('button can be clicked', async () => {
  //   await wrapper.find('NIcon').trigger('click')

  // })
})
