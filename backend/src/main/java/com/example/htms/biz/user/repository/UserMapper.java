package com.example.htms.biz.user.repository;

import com.example.htms.biz.user.model.User;
import com.example.htms.enumation.RoleEnum;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {

    // Lấy email theo username
    @Select("SELECT email FROM UserAccount WHERE username = #{username}")
    String findEmailByUsername(String username);

    // Lấy tất cả user
    @Select("SELECT id, username, full_name, password, phone, email, gender, nationality, role, status FROM UserAccount")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "username", column = "username"),
            @Result(property = "fullName", column = "full_name"),
            @Result(property = "password", column = "password"),
            @Result(property = "phone", column = "phone"),
            @Result(property = "email", column = "email"),
            @Result(property = "gender", column = "gender"),
            @Result(property = "nationality", column = "nationality"),
            @Result(property = "role", column = "role", javaType = RoleEnum.class),
            @Result(property = "status", column = "status")
    })
    List<User> getAllUsers();

    // Lấy user theo username
    @Select("SELECT id, username, full_name, password, phone, email, gender, nationality, role, status FROM UserAccount WHERE username = #{username}")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "username", column = "username"),
            @Result(property = "fullName", column = "full_name"),
            @Result(property = "password", column = "password"),
            @Result(property = "phone", column = "phone"),
            @Result(property = "email", column = "email"),
            @Result(property = "gender", column = "gender"),
            @Result(property = "nationality", column = "nationality"),
            @Result(property = "role", column = "role"),
            @Result(property = "status", column = "status")
    })
    User getUserByUsername(String username);

    // Lấy mật khẩu (hash) theo username
    @Select("SELECT password FROM UserAccount WHERE username = #{username}")
    String getPasswordByUsername(String username);

    // Thêm user mới
    @Insert("INSERT INTO UserAccount (username, full_name, password, phone, email, gender, nationality, role, status) " +
            "VALUES (#{username}, #{fullName}, #{password}, #{phone}, #{email}, #{gender}, #{nationality}, #{role}, #{status})")
    int insertUser(User user);

    // Cập nhật thông tin user
    @Update("UPDATE UserAccount SET full_name = #{fullName}, password = #{password}, phone = #{phone}, email = #{email}, " +
            "gender = #{gender}, nationality = #{nationality}, role = #{role}, status = #{status} " +
            "WHERE username = #{username}")
    int updateUser(User user);

    // Xóa user theo username
    @Delete("DELETE FROM UserAccount WHERE username = #{username}")
    int deleteUser(String username);

    // Tìm kiếm user theo role và status
    @Select("""
    <script>
    SELECT id, username, password, role, full_name, phone, email, gender, nationality, status
    FROM UserAccount
    WHERE 1=1
    <if test='roles != null and roles.size() > 0'>
        AND role IN
        <foreach item='role' collection='roles' open='(' separator=',' close=')'>
            #{role}
        </foreach>
    </if>
    <if test='statuses != null and statuses.size() > 0'>
        AND status IN
        <foreach item='status' collection='statuses' open='(' separator=',' close=')'>
            #{status}
        </foreach>
    </if>
    </script>
""")

    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "username", column = "username"),
            @Result(property = "fullName", column = "full_name"),
            @Result(property = "password", column = "password"),
            @Result(property = "phone", column = "phone"),
            @Result(property = "email", column = "email"),
            @Result(property = "gender", column = "gender"),
            @Result(property = "nationality", column = "nationality"),
            @Result(property = "role", column = "role"),
            @Result(property = "status", column = "status")
    })
    List<User> searchUsers(@Param("roles") List<RoleEnum> roles,
                           @Param("statuses") List<String> statuses);

    // Tìm kiếm nâng cao
    // Tìm kiếm nâng cao
    @Select("""
    <script>
    SELECT id, username, password, role, full_name, phone, email, gender, nationality, status
    FROM UserAccount
    WHERE 1=1
    <if test='roles != null and roles.size() > 0'>
        AND role IN
        <foreach item='role' collection='roles' open='(' separator=',' close=')'>
            #{role}
        </foreach>
    </if>
    <if test='statuses != null and statuses.size() > 0'>
        AND status IN
        <foreach item='status' collection='statuses' open='(' separator=',' close=')'>
            #{status}
        </foreach>
    </if>
    <if test='fullName != null and fullName != ""'>
        AND full_name LIKE CONCAT('%', #{fullName}, '%')
    </if>
    <if test='username != null and username != ""'>
        AND username LIKE CONCAT('%', #{username}, '%')
    </if>
    <if test='email != null and email != ""'>
        AND email LIKE CONCAT('%', #{email}, '%')
    </if>
    <if test='phone != null and phone != ""'>
        AND phone LIKE CONCAT('%', #{phone}, '%')
    </if>
    </script>
""")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "username", column = "username"),
            @Result(property = "fullName", column = "full_name"),
            @Result(property = "password", column = "password"),
            @Result(property = "phone", column = "phone"),
            @Result(property = "email", column = "email"),
            @Result(property = "gender", column = "gender"),
            @Result(property = "nationality", column = "nationality"),
            @Result(property = "role", column = "role"),
            @Result(property = "status", column = "status")
    })
    List<User> searchUsersAdvanced(
            @Param("roles") List<RoleEnum> roles,
            @Param("statuses") List<String> statuses,
            @Param("fullName") String fullName,
            @Param("username") String username,
            @Param("email") String email,
            @Param("phone") String phone
    );


    @Select("""
        <script>
        SELECT id, username, password, role, full_name, phone, email, gender, nationality, status
        FROM UserAccount
        WHERE id IN
        <foreach item='id' collection='userIds' open='(' separator=',' close=')'>
            #{id}
        </foreach>
        </script>
    """)
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "username", column = "username"),
            @Result(property = "fullName", column = "full_name"),
            @Result(property = "password", column = "password"),
            @Result(property = "phone", column = "phone"),
            @Result(property = "email", column = "email"),
            @Result(property = "gender", column = "gender"),
            @Result(property = "nationality", column = "nationality"),
            @Result(property = "role", column = "role"),
            @Result(property = "status", column = "status")
    })
    List<User> getUsersByIds(@Param("userIds") List<Integer> userIds);

    @Select("""
    SELECT id, username, full_name AS fullName, password, email, phone, role, status
    FROM UserAccount
    WHERE id = #{id}
""")
    User getUserById(@Param("id") Integer id);
    @Update("UPDATE UserAccount SET password = #{newPassword} WHERE username = #{username}")
    int updatePassword(@Param("username") String username, @Param("newPassword") String newPassword);

}
