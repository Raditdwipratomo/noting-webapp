module.exports = (sequelize, DataTypes)=>{
    const AlergiAnak = sequelize.define(
        "AlergiAnak", 
        {
            id :{
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            anak_id:{
                type: DataTypes.INTEGER,
                allowNull: false, 
                references:{
                    model: "anak", 
                    key: "anak_id"
                }
            },
            nama_alergen:{
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: "susu, telur, kacang",
            },
            tingkat_keparahan:{
                type: DataTypes.ENUM(
                    "ringan", 
                    "sedang",
                    "berat",
                ),
                defaultValue: "sedang",
            },
            deskripsi:{
                type: DataTypes.TEXT,
                allowNull: true,
            },
            tanggal_ditemukan:{
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: "created_at",
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: "updated_at",
            },
        },
        {
            tableName: "alergi_anak",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            indexes: [
                {
                name: "id_anak",
                fields: ["anak_id"],
                },
            ],
        }
    );

    AlergiAnak.associate = (models) => {
        AlergiAnak.belongsTo(models.Anak, {
            foreignKey: "anak_id",
            as : "anak",
            onDelete: "CASCADE",
        });
    };
    return AlergiAnak;
};