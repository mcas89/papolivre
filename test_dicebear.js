import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

try {
  const avatar = createAvatar(lorelei, {
    seed: 'Felix',
  });

  const dataUri = avatar.toDataUri(); // it returns a promise usually or maybe string
  if (dataUri instanceof Promise) {
     dataUri.then(res => console.log("DataUri Promise:", res.substring(0, 50)));
  } else {
     console.log("DataUri Sync:", dataUri.substring(0, 50));
  }
} catch(e) {
  console.error("Error:", e);
}
