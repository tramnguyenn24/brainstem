// src/app/data/apiResponses.js

export const authResponses = {
    // Response khi đăng nhập thành công
    signin: {
      status: "success",
      message: "Login successful",
      data: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sInVzZXJJZCI6MSwiaWF0IjoxNzMzMTIxMzE4LCJleHAiOjE3MzU3MTMzMTh9.R3p5aXrJqB4nDAPueg58W2Q_nzhxA52lE7VXZDu-yDE",
        refreshToken: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sInVzZXJJZCI6MSwiaWF0IjoxNzMzMTIxMzE4LCJleHAiOjE3MzU3MTMzMTh9.R3p5aXrJqB4nDAPueg58W2Q_nzhxA52lE7VXZDu-yDE",
        user: {
          id: 1,
          username: "admin",
          fullName: "Administrator",
          email: "admin@example.com",
          password: "admin123",
          phoneNumber: "0987654321",
          role: "ADMIN",
          state: "ACTIVE",
          position: "DIRECTOR_GENERAL",
          departments: [
            {
              id: 1,
              departmentName: "Phòng Công Nghệ Thông Tin"
            }
          ],
          imageUrl: "https://example.com/avatar.jpg",
          createdAt: "2024-03-01T00:00:00.000Z",
          updatedAt: "2024-03-01T00:00:00.000Z"
        }
      }
    },
  
    // Response khi đăng xuất thành công
    signout: {
      status: "success",
      message: "Logout successful"
    },
  
    // Response khi refresh token thành công
    refreshToken: {
      status: "success",
      message: "Token refreshed successfully",
      data: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sInVzZXJJZCI6MSwiaWF0IjoxNzMzMTIxMzE4LCJleHAiOjE3MzU3MTMzMTh9.R3p5aXrJqB4nDAPueg58W2Q_nzhxA52lE7VXZDu-yDE",
        refreshToken: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sInVzZXJJZCI6MSwiaWF0IjoxNzMzMTIxMzE4LCJleHAiOjE3MzU3MTMzMTh9.R3p5aXrJqB4nDAPueg58W2Q_nzhxA52lE7VXZDu-yDE"
      }
    },
  
    // Response khi quên mật khẩu
    forgotPassword: {
      status: "success",
      message: "Reset password email sent",
      data: {
        email: "user@example.com",
        resetToken: "09620614-6629-413c-8a61-e95fb318c008"
      }
    },
  
    // Response khi xác thực OTP
    verifyOTP: {
      status: "success",
      message: "OTP verified successfully",
      data: {
        email: "user@example.com",
        token: "09620614-6629-413c-8a61-e95fb318c008"
      }
    },
  
    // Response khi reset mật khẩu
    resetPassword: {
      status: "success",
      message: "Password reset successful"
    },
  
    // Response khi đổi mật khẩu
    changePassword: {
      status: "success",
      message: "Password changed successfully"
    },
  
    // Response khi cập nhật profile
    updateProfile: {
      status: "success",
      message: "Profile updated successfully",
      data: {
        id: 1,
        username: "admin",
        fullName: "Administrator Updated",
        email: "admin@example.com",
        phoneNumber: "0987654321",
        role: "ADMIN",
        state: "ACTIVE",
        position: "DIRECTOR_GENERAL",
        departments: [
          {
            id: 1,
            departmentName: "Phòng Công Nghệ Thông Tin"
          }
        ],
        imageUrl: "https://example.com/avatar.jpg",
        createdAt: "2024-03-01T00:00:00.000Z",
        updatedAt: "2024-03-01T00:00:00.000Z"
      }
    }
  };
  
  export const userResponses = {
    // Response khi lấy danh sách users
    getAllUsers: {
      status: "success",
      message: "Users retrieved successfully",
      data: [
        {
          id: 1,
          username: "admin",
          fullName: "Administrator",
          email: "admin@example.com",
          password: "admin123",
          phoneNumber: "0987654321",
          role: "ADMIN",
          state: "ACTIVE",
          position: "DIRECTOR_GENERAL",
          departments: [
            {
              id: 1,
              departmentName: "Phòng Công Nghệ Thông Tin"
            }
          ],
          imageUrl: "https://example.com/avatar.jpg",
          createdAt: "2024-03-01T00:00:00.000Z",
          updatedAt: "2024-03-01T00:00:00.000Z"
        },
        {
          id: 2,
          username: "manager",
          fullName: "Manager User",
          email: "manager@example.com",
          password: "manager123",
          phoneNumber: "0987654322",
          role: "MANAGER",
          state: "ACTIVE",
          position: "DEPARTMENT_HEAD",
          departments: [
            {
              id: 2,
              departmentName: "Phòng Kinh Doanh"
            }
          ],
          imageUrl: "https://example.com/avatar2.jpg",
          createdAt: "2024-03-01T00:00:00.000Z",
          updatedAt: "2024-03-01T00:00:00.000Z"
        }
      ]
    },
  
    // Response khi tạo user mới
    createUser: {
      status: "success",
      message: "User created successfully",
      data: {
        id: 3,
        username: "newuser",
        fullName: "New User",
        email: "newuser@example.com",
        password: "newuser123",
        phoneNumber: "0987654323",
        role: "USER",
        state: "ACTIVE",
        position: "STAFF",
        departments: [],
        imageUrl: null,
        createdAt: "2024-03-01T00:00:00.000Z",
        updatedAt: "2024-03-01T00:00:00.000Z"
      }
    },
  
    // Response khi cập nhật user
    updateUser: {
      status: "success",
      message: "User updated successfully",
      data: {
        id: 1,
        username: "admin",
        fullName: "Administrator Updated",
        email: "admin@example.com",
        phoneNumber: "0987654321",
        role: "ADMIN",
        state: "ACTIVE",
        position: "DIRECTOR_GENERAL",
        departments: [
          {
            id: 1,
            departmentName: "Phòng Công Nghệ Thông Tin"
          }
        ],
        imageUrl: "https://example.com/avatar.jpg",
        createdAt: "2024-03-01T00:00:00.000Z",
        updatedAt: "2024-03-01T00:00:00.000Z"
      }
    },
  
    // Response khi xóa user
    deleteUser: {
      status: "success",
      message: "User deleted successfully"
    },
  
    // Response khi cập nhật trạng thái user
    updateUserState: {
      status: "success",
      message: "User state updated successfully",
      data: {
        id: 1,
        state: "INACTIVE"
      }
    }
  };
  
  // Các response lỗi thông thường
  export const errorResponses = {
    // Lỗi xác thực
    unauthorized: {
      status: "error",
      message: "Unauthorized access",
      code: 401
    },
  
    // Lỗi không tìm thấy
    notFound: {
      status: "error",
      message: "Resource not found",
      code: 404
    },
  
    // Lỗi validation
    validationError: {
      status: "error",
      message: "Validation failed",
      code: 400,
      errors: [
        {
          field: "username",
          message: "Username is required"
        },
        {
          field: "password",
          message: "Password must be at least 8 characters"
        }
      ]
    },
  
    // Lỗi server
    serverError: {
      status: "error",
      message: "Internal server error",
      code: 500
    }
  };
  
  // Các enum values
  export const enums = {
    roles: ["ADMIN", "MANAGER", "LEADERSHIP", "USER"],
    states: ["ACTIVE", "INACTIVE", "BLOCKED"],
    positions: ["DIRECTOR_GENERAL", "DEPARTMENT_HEAD", "TEAM_LEADER", "STAFF"]
  };