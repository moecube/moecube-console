import axios from 'axios';
import config from './config';



async function createApp(app) {
  return await axios.post(config.new_app(app.id), {
    id: app.id,
    name: app.name,
    author: '1',
  });
}

async function updateApp(app) {
  const {id, name, description, developers, publishers, released_at, category, tags, dependencies, references, homepage, actions, version, conference, icon, cover, background, news, ...other} = app;
  return await axios.patch(config.new_app(app.id), {
    id,
    name,
    description,
    developers,
    publishers,
    released_at,
    category,
    tags,
    dependencies,
    references,
    homepage,
    homepage,
    actions,
    version,
    conference,
    icon,
    cover,
    background,
    news: {}
    ...other,
  });

}


async function main() {

  let {data} = await axios.get(config.old_apps_json);

  try {
    for (let app of data) {
      await createApp(app).catch(error => {});
      await updateApp(app);
    }
  } catch (e) {
    console.trace(e);
  }
}

main();


