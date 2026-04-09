import Vue from 'vue'
import Vuex from 'vuex'
import { userApi } from '@/api'
import { setTokenCache } from '@/utils/request'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || ''
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
      // 同步更新缓存中的token
      setTokenCache(token)
    },
    LOGOUT(state) {
      state.token = ''
      localStorage.removeItem('token')
      // 清除缓存中的token
      setTokenCache(null)
    }
  },
  actions: {
    async login({ commit }, userInfo) {
      try {
        const response = await userApi.login(userInfo)
        if (response.code === 200 || response.code === "0000") {
          const token = response.data?.token || response.token
          commit('SET_TOKEN', token)
          return response
        } else {
          throw new Error(response.message || '登录失败')
        }
      } catch (error) {
        console.error('登录接口调用失败:', error)
        throw error
      }
    },
    async register(context, userInfo) {
      try {
        const response = await userApi.register(userInfo)
        if (response.code === 200 || response.code === "0000") {
          return response
        } else {
          throw new Error(response.message || '注册失败')
        }
      } catch (error) {
        console.error('注册接口调用失败:', error)
        throw error
      }
    },
    logout({ commit }) {
      commit('LOGOUT')
    }
  }
})