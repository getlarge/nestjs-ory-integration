export const get = <TObject extends object, TKey extends keyof TObject>(
  obj: TObject,
  path: TKey,
  defaultValue = undefined
) => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res: object, key: string) =>
          res !== null && res !== undefined ? res[key] : res,
        obj
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};
