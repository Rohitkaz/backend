export const singleton =(
    name,
    valueFactory
  ) => {
    const g = global;
    g.__singletons ??= {};
    g.__singletons[name] ??= valueFactory();
    return g.__singletons[name];
  };