const mongoose = require('mongoose');

const uri = "mongodb+srv://himanshuupadhyay210_db_user:311%40Himanshu@templateforgecluster.kzec9gy.mongodb.net/?appName=TemplateForgeCluster";

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected');
    const db = mongoose.connection.db;
    const appsCollection = db.collection('apps');
    const result = await appsCollection.updateMany(
      { sourceTemplate: "" },
      { $set: { sourceTemplate: null } }
    );
    console.log('Modified count:', result.modifiedCount);
    
    const result2 = await appsCollection.updateMany(
      { sourceTemplate: { $type: "string" } },
      { $set: { sourceTemplate: null } }
    );
    console.log('Modified count (strings):', result2.modifiedCount);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
