'use babel';

export const PKG_STATUS = {
  notPresent: 0,
  disabled: 1,
  loaded: 2,
};

class PackageManager {
  packageStatus(pkgName) {
    if (atom.packages.getLoadedPackage(pkgName)) {
      return PKG_STATUS.loaded;
    } else if (atom.packages.isPackageDisabled(pkgName)) {
      return PKG_STATUS.disabled;
    }

    return PKG_STATUS.notPresent;
  }

  async enablePackage(pkgName, askFirst = false, askTitle = 'Dbex engine') {
    let pkgStatus = this.packageStatus(pkgName);
    let command = ()=>false;

    if (pkgStatus === PKG_STATUS.disabled) {
      command = pkgName=>atom.packages.enablePackage(pkgName);
    } else if (pkgStatus === PKG_STATUS.notPresent) {
      const pack = await atom.packages.activatePackage('settings-view');

      if (!pack) {
        return
      }

      const mainModule = pack.mainModule
      const settingsview = mainModule.createSettingsView({
        uri: pack.mainModule.configUri
      })

      command = (pkgName)=>{
        settingsview.packageManager.install({ name: pkgName }, error => {
          if (error) {
            atom.notifications.addError(askTitle, {dismissable: true, detail: error});
          } else {
            atom.notifications.addSuccess(askTitle, {
              dismissable: true,
              detail: `${pkgName} successfully installed.`
            })
          }
        })
      };
    }

    if (askFirst) {
      this.askToInstall(pkgName, askTitle, command);
    } else {
      command(pkgName);
    }
  }

  askToInstall(pkgName, msgTitle, onAllow) {
    const notification = atom.notifications.addInfo(msgTitle, {
      dismissable: true,
      icon: 'cloud-download',
      detail:
        `A missing package, ${pkgName}, needs to be installed/activated in order to work properly.`,
      description: `Do you allow to install/activate ${pkgName} ?`,
      buttons: [
        {
          text: 'Yes',
          onDidClick: () => {
            notification.dismiss();
            onAllow(pkgName);
          }
        },
        {
          text: 'No',
          onDidClick: () => {
            notification.dismiss();
          }
        },
      ]
    });
  }
}

export default new PackageManager();
