module.exports = (sequelize, DataTypes) => {
    const NguoiDung = sequelize.define("NguoiDung", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        hoTen: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        matKhau: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        diaChi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sdt: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phanQuyen: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        trangThai: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    });
    NguoiDung.associate = function (models) {
        NguoiDung.belongsTo(models.VaiTro);
        NguoiDung.hasMany(models.GioHang, {
            onDelete: "cascade"
        });
        NguoiDung.hasMany(models.DonHang);
        NguoiDung.hasMany(models.YeuThich);
        NguoiDung.hasMany(models.DanhGia);
        NguoiDung.hasMany(models.BinhLuan);
        NguoiDung.hasMany(models.BinhLuan2);
    };

    return NguoiDung;
}