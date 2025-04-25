<template>
  <view class="container">
    <view class="header">
      <text class="title">{{ isAddTeam ? '创建团队' : '团队详情' }}</text>
      <button v-if="!isAddTeam" class="edit-btn" @click="toggleEditMode">
        {{ isEditing ? '保存' : '编辑' }}
      </button>
    </view>
    
    <!-- 团队表单 -->
    <view class="team-form" v-if="isAddTeam || isEditing">
      <view class="input-group">
        <text class="label">团队名称</text>
        <input 
          class="input" 
          type="text" 
          v-model="teamForm.name" 
          placeholder="请输入团队名称"
        />
      </view>
      
      <view class="input-group">
        <text class="label">团队描述</text>
        <textarea 
          class="textarea" 
          v-model="teamForm.description" 
          placeholder="请输入团队描述"
          maxlength="200"
          auto-height
        />
      </view>
    </view>
    
    <!-- 团队信息展示 -->
    <view class="team-info" v-else>
      <view class="info-item">
        <text class="info-label">团队名称</text>
        <text class="info-value">{{ team.name }}</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">团队描述</text>
        <text class="info-value">{{ team.description || '暂无描述' }}</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">创建时间</text>
        <text class="info-value">{{ formatDate(team.createdAt) }}</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">创建者</text>
        <text class="info-value">{{ creatorName }}</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">笔记数量</text>
        <text class="info-value">{{ team.notes ? team.notes.length : 0 }}</text>
      </view>
    </view>
    
    <!-- 成员管理 -->
    <view class="members-section">
      <view class="section-header">
        <text class="section-title">团队成员 ({{ members.length }})</text>
        <button v-if="isAdmin" class="add-btn" @click="showAddMemberModal">添加成员</button>
      </view>
      
      <view class="members-list">
        <view 
          class="member-item" 
          v-for="member in members" 
          :key="member.id"
        >
          <view class="member-avatar">
            <text v-if="!member.avatar">{{ member.name.charAt(0) }}</text>
            <image v-else :src="member.avatar" mode="aspectFill"></image>
          </view>
          <view class="member-info">
            <text class="member-name">{{ member.name }}</text>
            <text class="member-email">{{ member.email }}</text>
          </view>
          <view class="member-role">
            <text>{{ getRoleName(member.role) }}</text>
            <button 
              v-if="isAdmin && member.id !== currentUser.id" 
              class="role-btn"
              @click="showChangeRoleModal(member)"
            >
              更改
            </button>
          </view>
          <button 
            v-if="isAdmin && member.id !== currentUser.id" 
            class="remove-btn"
            @click="confirmRemoveMember(member)"
          >
            移除
          </button>
        </view>
      </view>
    </view>
    
    <!-- 团队笔记 -->
    <view class="notes-section" v-if="!isAddTeam">
      <view class="section-header">
        <text class="section-title">团队笔记 ({{ teamNotes.length }})</text>
      </view>
      
      <view class="notes-list">
        <view 
          v-if="teamNotes.length === 0" 
          class="empty-tips"
        >
          <text>暂无团队笔记</text>
        </view>
        <view 
          class="note-item" 
          v-for="note in teamNotes" 
          :key="note.id"
          @click="viewNote(note.id)"
        >
          <view class="note-title">{{ note.title || '无标题' }}</view>
          <view class="note-preview">{{ note.content ? note.content.substring(0, 50) : '无内容' }}</view>
          <view class="note-info">
            <text class="note-owner">{{ getOwnerName(note) }}</text>
            <text class="note-time">{{ formatDate(note.updatedAt || note.createdAt) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 按钮区域 -->
    <view class="action-buttons">
      <button 
        v-if="isAddTeam" 
        class="action-btn create-btn" 
        @click="createTeam"
      >
        创建团队
      </button>
      <button 
        v-else-if="isEditing" 
        class="action-btn save-btn" 
        @click="saveTeam"
      >
        保存更改
      </button>
      <button 
        v-else-if="isAdmin" 
        class="action-btn danger-btn" 
        @click="confirmDeleteTeam"
      >
        解散团队
      </button>
      <button 
        v-else 
        class="action-btn danger-btn" 
        @click="confirmLeaveTeam"
      >
        退出团队
      </button>
    </view>
    
    <!-- 添加成员模态框 -->
    <view class="modal" v-if="showAddMember">
      <view class="modal-mask" @click="cancelAddMember"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">添加团队成员</text>
          <text class="modal-close" @click="cancelAddMember">×</text>
        </view>
        <view class="modal-body">
          <view class="search-box">
            <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="搜索用户" 
              @input="searchUsers"
            />
          </view>
          
          <view class="user-list">
            <view 
              class="user-item" 
              v-for="user in searchResults" 
              :key="user.id"
              @click="selectUser(user)"
            >
              <view class="user-avatar">
                <text v-if="!user.avatar">{{ user.name.charAt(0) }}</text>
                <image v-else :src="user.avatar" mode="aspectFill"></image>
              </view>
              <view class="user-info">
                <text class="user-name">{{ user.name }}</text>
                <text class="user-email">{{ user.email }}</text>
              </view>
              <view class="check-icon" v-if="selectedUserId === user.id">✓</view>
            </view>
          </view>
          
          <view class="role-selector" v-if="selectedUserId">
            <text class="role-label">选择角色:</text>
            <view class="role-options">
              <view 
                class="role-option" 
                :class="{ active: selectedRole === 'member' }"
                @click="selectedRole = 'member'"
              >
                成员
              </view>
              <view 
                class="role-option" 
                :class="{ active: selectedRole === 'editor' }"
                @click="selectedRole = 'editor'"
              >
                编辑者
              </view>
              <view 
                class="role-option" 
                :class="{ active: selectedRole === 'admin' }"
                @click="selectedRole = 'admin'"
              >
                管理员
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="cancelAddMember">取消</button>
          <button 
            class="modal-btn confirm-btn" 
            :disabled="!selectedUserId" 
            @click="addMember"
          >
            添加
          </button>
        </view>
      </view>
    </view>
    
    <!-- 更改角色模态框 -->
    <view class="modal" v-if="showChangeRole">
      <view class="modal-mask" @click="cancelChangeRole"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">更改成员角色</text>
          <text class="modal-close" @click="cancelChangeRole">×</text>
        </view>
        <view class="modal-body">
          <view class="member-detail">
            <text class="member-name-large">{{ selectedMember.name }}</text>
            <text class="member-email">{{ selectedMember.email }}</text>
          </view>
          
          <view class="role-selector">
            <text class="role-label">选择新角色:</text>
            <view class="role-options">
              <view 
                class="role-option" 
                :class="{ active: newRole === 'member' }"
                @click="newRole = 'member'"
              >
                成员
              </view>
              <view 
                class="role-option" 
                :class="{ active: newRole === 'editor' }"
                @click="newRole = 'editor'"
              >
                编辑者
              </view>
              <view 
                class="role-option" 
                :class="{ active: newRole === 'admin' }"
                @click="newRole = 'admin'"
              >
                管理员
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="cancelChangeRole">取消</button>
          <button class="modal-btn confirm-btn" @click="changeRole">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getCurrentUser, 
  createTeam,
  getUsers,
  getTeamMembers,
  checkAuth
} from '@/utils/userService.js';
import { getTeamNotes } from '@/utils/noteService.js';

export default {
  data() {
    return {
      teamId: '',
      isAddTeam: true,
      isEditing: false,
      team: {
        name: '',
        description: '',
        members: [],
        createdAt: '',
        createdBy: '',
        notes: []
      },
      teamForm: {
        name: '',
        description: ''
      },
      currentUser: null,
      members: [],
      teamNotes: [],
      creatorName: '',
      
      // 添加成员相关
      showAddMember: false,
      searchTerm: '',
      searchResults: [],
      selectedUserId: '',
      selectedRole: 'member',
      
      // 更改角色相关
      showChangeRole: false,
      selectedMember: {
        id: '',
        name: '',
        email: '',
        role: ''
      },
      newRole: 'member'
    }
  },
  computed: {
    isAdmin() {
      if (!this.currentUser || !this.team || !this.team.roles) return false;
      return this.team.roles[this.currentUser.id] === 'admin';
    }
  },
  onLoad(options) {
    // 检查用户是否已登录
    if (!checkAuth()) return;
    
    this.currentUser = getCurrentUser();
    
    if (options.id) {
      this.teamId = options.id;
      this.isAddTeam = false;
      this.loadTeam();
    } else {
      this.isAddTeam = true;
    }
  },
  methods: {
    loadTeam() {
      // 从服务器加载团队信息
      // 此处简化为本地模拟
      const teams = uni.getStorageSync('teams') || [];
      const team = teams.find(t => t.id === this.teamId);
      
      if (team) {
        this.team = team;
        this.teamForm.name = team.name;
        this.teamForm.description = team.description;
        
        // 加载团队成员
        this.loadMembers();
        
        // 加载团队笔记
        this.loadTeamNotes();
        
        // 获取创建者名称
        this.getCreatorName();
      } else {
        uni.showToast({
          title: '找不到团队信息',
          icon: 'none'
        });
        
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    async loadMembers() {
      const result = await getTeamMembers(this.teamId);
      if (result.success) {
        this.members = result.members;
      }
    },
    async loadTeamNotes() {
      const result = await getTeamNotes(this.teamId);
      if (result.success) {
        this.teamNotes = result.notes;
      }
    },
    getCreatorName() {
      const users = uni.getStorageSync('users') || [];
      const creator = users.find(u => u.id === this.team.createdBy);
      this.creatorName = creator ? creator.name : '未知';
    },
    toggleEditMode() {
      if (this.isEditing) {
        this.saveTeam();
      } else {
        this.isEditing = true;
      }
    },
    async saveTeam() {
      // 验证输入
      if (!this.teamForm.name.trim()) {
        uni.showToast({
          title: '请输入团队名称',
          icon: 'none'
        });
        return;
      }
      
      // 更新团队信息
      const teams = uni.getStorageSync('teams') || [];
      const teamIndex = teams.findIndex(t => t.id === this.teamId);
      
      if (teamIndex !== -1) {
        teams[teamIndex].name = this.teamForm.name;
        teams[teamIndex].description = this.teamForm.description;
        teams[teamIndex].updatedAt = new Date().toISOString();
        
        uni.setStorageSync('teams', teams);
        
        this.team = teams[teamIndex];
        this.isEditing = false;
        
        uni.showToast({
          title: '团队信息已更新',
          icon: 'success'
        });
      }
    },
    async createTeam() {
      // 验证输入
      if (!this.teamForm.name.trim()) {
        uni.showToast({
          title: '请输入团队名称',
          icon: 'none'
        });
        return;
      }
      
      const result = await createTeam(this.teamForm);
      
      if (result.success) {
        uni.showToast({
          title: '团队创建成功',
          icon: 'success'
        });
        
        // 跳转到团队详情页
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/team/team?id=${result.team.id}`
          });
        }, 1500);
      } else {
        uni.showToast({
          title: result.message || '创建失败',
          icon: 'none'
        });
      }
    },
    confirmDeleteTeam() {
      uni.showModal({
        title: '确认解散团队',
        content: '解散团队后，所有团队数据将被删除，且操作不可撤销。确定要解散该团队吗？',
        confirmText: '解散',
        confirmColor: '#FF5252',
        success: (res) => {
          if (res.confirm) {
            this.deleteTeam();
          }
        }
      });
    },
    deleteTeam() {
      // 删除团队
      const teams = uni.getStorageSync('teams') || [];
      const updatedTeams = teams.filter(t => t.id !== this.teamId);
      
      uni.setStorageSync('teams', updatedTeams);
      
      // TODO: 清理相关的用户团队关联和笔记关联
      
      uni.showToast({
        title: '团队已解散',
        icon: 'success'
      });
      
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    },
    confirmLeaveTeam() {
      uni.showModal({
        title: '确认退出团队',
        content: '退出团队后，您将无法访问团队内的笔记。确定要退出该团队吗？',
        confirmText: '退出',
        confirmColor: '#FF5252',
        success: (res) => {
          if (res.confirm) {
            this.leaveTeam();
          }
        }
      });
    },
    leaveTeam() {
      // 用户退出团队
      const teams = uni.getStorageSync('teams') || [];
      const teamIndex = teams.findIndex(t => t.id === this.teamId);
      
      if (teamIndex !== -1) {
        // 从成员列表中移除用户
        teams[teamIndex].members = teams[teamIndex].members.filter(id => id !== this.currentUser.id);
        
        // 从角色中移除用户
        if (teams[teamIndex].roles) {
          delete teams[teamIndex].roles[this.currentUser.id];
        }
        
        uni.setStorageSync('teams', teams);
        
        // 从用户的团队列表中移除
        const users = uni.getStorageSync('users') || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1 && users[userIndex].teams) {
          users[userIndex].teams = users[userIndex].teams.filter(id => id !== this.teamId);
          uni.setStorageSync('users', users);
        }
        
        uni.showToast({
          title: '已退出团队',
          icon: 'success'
        });
        
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    showAddMemberModal() {
      this.showAddMember = true;
      this.searchTerm = '';
      this.searchResults = [];
      this.selectedUserId = '';
      this.selectedRole = 'member';
      
      // 加载初始用户列表
      this.searchUsers();
    },
    cancelAddMember() {
      this.showAddMember = false;
    },
    async searchUsers() {
      const result = await getUsers(this.searchTerm);
      
      if (result.success) {
        // 过滤掉已经在团队中的用户
        this.searchResults = result.users.filter(user => 
          !this.members.some(member => member.id === user.id)
        );
      }
    },
    selectUser(user) {
      this.selectedUserId = user.id;
    },
    async addMember() {
      if (!this.selectedUserId || !this.selectedRole) {
        return;
      }
      
      // 添加成员到团队
      const teams = uni.getStorageSync('teams') || [];
      const teamIndex = teams.findIndex(t => t.id === this.teamId);
      
      if (teamIndex !== -1) {
        // 添加成员ID
        if (!teams[teamIndex].members.includes(this.selectedUserId)) {
          teams[teamIndex].members.push(this.selectedUserId);
        }
        
        // 设置角色
        if (!teams[teamIndex].roles) {
          teams[teamIndex].roles = {};
        }
        teams[teamIndex].roles[this.selectedUserId] = this.selectedRole;
        
        uni.setStorageSync('teams', teams);
        
        // 更新用户的团队关联
        const users = uni.getStorageSync('users') || [];
        const userIndex = users.findIndex(u => u.id === this.selectedUserId);
        
        if (userIndex !== -1) {
          if (!users[userIndex].teams) {
            users[userIndex].teams = [];
          }
          
          if (!users[userIndex].teams.includes(this.teamId)) {
            users[userIndex].teams.push(this.teamId);
            uni.setStorageSync('users', users);
          }
        }
        
        // 重新加载成员列表
        await this.loadMembers();
        
        uni.showToast({
          title: '成员添加成功',
          icon: 'success'
        });
        
        this.cancelAddMember();
      }
    },
    showChangeRoleModal(member) {
      this.selectedMember = { ...member };
      this.newRole = member.role;
      this.showChangeRole = true;
    },
    cancelChangeRole() {
      this.showChangeRole = false;
    },
    changeRole() {
      // 更改成员角色
      const teams = uni.getStorageSync('teams') || [];
      const teamIndex = teams.findIndex(t => t.id === this.teamId);
      
      if (teamIndex !== -1 && teams[teamIndex].roles) {
        teams[teamIndex].roles[this.selectedMember.id] = this.newRole;
        uni.setStorageSync('teams', teams);
        
        // 更新本地成员列表
        const memberIndex = this.members.findIndex(m => m.id === this.selectedMember.id);
        if (memberIndex !== -1) {
          this.members[memberIndex].role = this.newRole;
        }
        
        uni.showToast({
          title: '角色已更新',
          icon: 'success'
        });
        
        this.cancelChangeRole();
      }
    },
    confirmRemoveMember(member) {
      uni.showModal({
        title: '确认移除成员',
        content: `确定要将"${member.name}"从团队中移除吗？`,
        confirmText: '移除',
        confirmColor: '#FF5252',
        success: (res) => {
          if (res.confirm) {
            this.removeMember(member.id);
          }
        }
      });
    },
    async removeMember(memberId) {
      // 从团队中移除成员
      const teams = uni.getStorageSync('teams') || [];
      const teamIndex = teams.findIndex(t => t.id === this.teamId);
      
      if (teamIndex !== -1) {
        // 移除成员ID
        teams[teamIndex].members = teams[teamIndex].members.filter(id => id !== memberId);
        
        // 移除角色
        if (teams[teamIndex].roles && teams[teamIndex].roles[memberId]) {
          delete teams[teamIndex].roles[memberId];
        }
        
        uni.setStorageSync('teams', teams);
        
        // 更新用户的团队关联
        const users = uni.getStorageSync('users') || [];
        const userIndex = users.findIndex(u => u.id === memberId);
        
        if (userIndex !== -1 && users[userIndex].teams) {
          users[userIndex].teams = users[userIndex].teams.filter(id => id !== this.teamId);
          uni.setStorageSync('users', users);
        }
        
        // 更新本地成员列表
        this.members = this.members.filter(m => m.id !== memberId);
        
        uni.showToast({
          title: '成员已移除',
          icon: 'success'
        });
      }
    },
    getRoleName(role) {
      const roleNames = {
        'admin': '管理员',
        'editor': '编辑者',
        'member': '成员'
      };
      return roleNames[role] || '成员';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    getOwnerName(note) {
      return note.owner ? note.owner.name : '未知';
    },
    viewNote(noteId) {
      uni.navigateTo({
        url: `/pages/edit/edit?id=${noteId}`
      });
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.edit-btn {
  background-color: #007AFF;
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
}

/* 表单样式 */
.team-form {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.input-group {
  margin-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.input, .textarea {
  width: 100%;
  border: 1rpx solid #ddd;
  border-radius: 6rpx;
  padding: 16rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.textarea {
  min-height: 150rpx;
}

/* 信息展示样式 */
.team-info {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 成员管理样式 */
.members-section, .notes-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
}

.add-btn {
  background-color: #4CAF50;
  color: #fff;
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.member-item:last-child {
  border-bottom: none;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 36rpx;
  margin-right: 20rpx;
  overflow: hidden;
}

.member-avatar image {
  width: 100%;
  height: 100%;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.member-email {
  font-size: 24rpx;
  color: #999;
}

.member-role {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.member-role text {
  font-size: 24rpx;
  color: #666;
  margin-right: 10rpx;
}

.role-btn {
  background-color: transparent;
  border: 1rpx solid #ddd;
  color: #666;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.remove-btn {
  background-color: #FF5252;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

/* 笔记列表样式 */
.empty-tips {
  text-align: center;
  color: #999;
  padding: 30rpx 0;
}

.note-item {
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.note-item:last-child {
  border-bottom: none;
}

.note-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
}

.note-preview {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-info {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999;
}

/* 按钮区域 */
.action-buttons {
  margin-top: 30rpx;
  margin-bottom: 50rpx;
}

.action-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 32rpx;
  border-radius: 45rpx;
}

.create-btn, .save-btn {
  background-color: #007AFF;
  color: #fff;
}

.danger-btn {
  background-color: #FF5252;
  color: #fff;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 80%;
  max-height: 80%;
  background-color: #fff;
  border-radius: 12rpx;
  position: relative;
  z-index: 101;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.modal-close {
  font-size: 36rpx;
  color: #999;
  padding: 0 10rpx;
}

.modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  text-align: center;
  padding: 15rpx 0;
  font-size: 28rpx;
  border-radius: 6rpx;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
  margin-right: 15rpx;
}

.confirm-btn {
  background-color: #007AFF;
  color: #fff;
}

.confirm-btn[disabled] {
  background-color: #cccccc;
  color: #fff;
}

/* 搜索框样式 */
.search-box {
  margin-bottom: 20rpx;
}

.search-box input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 6rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

/* 用户列表样式 */
.user-list {
  max-height: 400rpx;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.user-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 32rpx;
  margin-right: 15rpx;
  overflow: hidden;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.user-email {
  font-size: 24rpx;
  color: #999;
}

.check-icon {
  width: 40rpx;
  height: 40rpx;
  color: #4CAF50;
  font-size: 32rpx;
  font-weight: bold;
}

/* 角色选择器 */
.role-selector {
  margin-top: 30rpx;
}

.role-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.role-options {
  display: flex;
  gap: 15rpx;
}

.role-option {
  flex: 1;
  text-align: center;
  padding: 15rpx 0;
  border: 1rpx solid #ddd;
  border-radius: 6rpx;
  font-size: 28rpx;
  color: #666;
}

.role-option.active {
  background-color: #007AFF;
  color: #fff;
  border-color: #007AFF;
}

.member-detail {
  text-align: center;
  margin-bottom: 30rpx;
}

.member-name-large {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}
</style> 