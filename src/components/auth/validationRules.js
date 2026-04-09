// 表单验证规则库

export const validationRules = {
  // 账号验证规则
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]{1,20}$/, message: '仅支持大小写英文+数字，最多20位', trigger: 'blur' }
  ],
  
  // 密码验证规则
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]{1,20}$/, message: '仅支持大小写英文+数字，最多20位', trigger: 'blur' }
  ],
  
  // 确认密码验证规则
  confirmPassword: (passwordField) => [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback, source) => {
        if (value !== source[passwordField]) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  
  // 手机号验证规则
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  
  // 验证码验证规则
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  
  // 统一社会信用代码验证规则
  creditCode: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' }
  ],
  
  // 联系人验证规则
  contact: [
    { required: true, message: '请输入联系人/经办人', trigger: 'blur' }
  ]
}

// 导出默认验证规则
export default validationRules