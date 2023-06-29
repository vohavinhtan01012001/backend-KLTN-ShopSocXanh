module.exports = (sequelize, DataTypes) => {
    const ChatLieu = sequelize.define("ChatLieu", {
        tenChatLieu: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        moTa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    ChatLieu.associate = (models) => {
        ChatLieu.hasMany(models.SanPham, {
            onDelete: "cascade"
        });
    }

    return ChatLieu;
}