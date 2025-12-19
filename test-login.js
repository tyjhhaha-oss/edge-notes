// 测试登录功能的脚本
async function testLogin() {
  try {
    // 测试 Pages Router API
    console.log('测试 Pages Router API...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'admin123' }),
    });
    
    console.log('状态码:', response.status);
    console.log('状态文本:', response.statusText);
    
    const text = await response.text();
    console.log('响应内容:', text);
    
    // 尝试解析为 JSON
    try {
      const json = JSON.parse(text);
      console.log('JSON 解析成功:', json);
    } catch (e) {
      console.log('不是 JSON 格式');
    }
    
    console.log('响应头:');
    for (let [key, value] of response.headers) {
      console.log(`${key}: ${value}`);
    }
    
  } catch (error) {
    console.error('请求失败:', error);
  }
}

testLogin();