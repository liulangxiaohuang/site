<script setup lang="ts">
import IconEmail from './icons/IconEmail.vue'
import IconWechat from './icons/IconWechat.vue'
</script>

<template>
  <footer id="contact">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Get In Touch</h3>
        <p>户外｜旅行｜汽车｜慢生活 | 露营博主｜汽车博主｜旅行博主</p>
        <p>喜欢自然原生态生活，探索更多的生活方式，主打车内舒适生活，氛围感营造，以真实的vanlife体验者，讲述一个普通汽车旅行者的故事。</p>
        <p>目前有两台玩具车：</p>
        <p>🚕 北斗星·小黄·主打姿态<br />🚐 全 顺·小灰·主打舒适</p>
        <div class="line"></div>
        <p></p>
        <p>Outdoor | Travel | Automotive | Slow Living | Photographer | Vlogger</p>
        <p>I’m passionate about a back-to-nature lifestyle and exploring diverse ways of living. My focus is on creating cozy, vehicle-based living spaces and capturing the right vibe, all while embracing genuine vanlife experiences. Here, I share the extraordinary stories of an ordinary car-bound traveler.</p>
        <p>Currently, I have two fun vehicles in my fleet:</p>
        <p>🚕 “Little Yellow” – a SUZUKI, tuned for style and stance <br />🚐 “Little Gray” – a Ford Transit, built for comfort and coziness</p>
        <p></p>
        <p></p>
      </div>
      <div class="footer-section">
        <div class="footer-links">
          <p style="margin-top: 8px;">
            <IconEmail class="icon-email" />
            <span>immissile@qq.com</span>
          </p>
          <p>
            <IconWechat class="icon-wechat" />
            <span>liulangxiaohuang</span>
            <i>请注明来意 / Please indicate your purpose</i>
          </p>
          <!-- <a href="#">Instagram</a>
          <a href="#">LinkedIn</a> -->
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2025 Wild Huang</span>
      <div class="social-links">
        <a href="https://www.instagram.com/WanderingHuang" target="_blank">Instagram</a>
        <a href="http://www.youtube.com/@WanderingHuang" target="_blank">Youtube</a>
        <a href="https://xiaohongshu.com/user/profile/63abb24a000000002702850b" target="_blank">小红书</a>
        <a href="https://www.douyin.com/user/MS4wLjABAAAA6037NiNVocmluEJwqrFWVVRs4-ANidJlEKENmKZWGtK2xJJITji3zWOxn78HWJ7n" target="_blank">抖音</a>
        <a href="https://space.bilibili.com/3493111948904874" target="_blank">B站</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.icon-email {
  width: 20px;
}
.icon-wechat {
  width: 26px;
  margin-left: -3px;
}
.footer-links {
  p {
    /* margin: 0; */
    margin-bottom: 10px;
    > span {
      display: inline-block;
      width: 100%;
    }
    > i {
      font-size: 11px;
    }
  }
}
</style>
