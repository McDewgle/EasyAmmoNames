import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { LocaleService } from "@spt/services/LocaleService";
import { ItemType } from "@spt/models/eft/common/tables/ITemplateItem";
import { VFS } from "@spt/utils/VFS";
import path from "path";

class EasyAmmoNames implements IPostDBLoadMod {
    private modConfig;
    private debug = true;

    postDBLoad(container: DependencyContainer): void {
        const vfs = container.resolve<VFS>("VFS");
        const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const localeService = container.resolve<LocaleService>("LocaleService");
        const itemDatabase = databaseServer.getTables().templates.items;
        const handbookDatabase = databaseServer.getTables().templates.handbook;
        const localeDatabase = localeService.getLocaleDb();
        
        this.modConfig = JSON.parse(vfs.readFile(path.resolve(__dirname, "../config/config.json")));

        for (const itemTpl in this.modConfig["items"]) {
            const itemInfo = this.modConfig["items"][itemTpl];
            
            if (itemTpl in itemDatabase) {
                const itemName = itemTpl + " Name";
                const itemShortName = itemTpl + " ShortName";
                const itemDescription = itemTpl + " Description";

                if (itemInfo["Name"] != "" && itemName in localeDatabase) {
                    localeDatabase[itemName] = itemInfo["Name"];
                }

                if (itemInfo["ShortName"] != "" && itemShortName in localeDatabase) {
                    if (itemInfo["ShortName"].length > 9) {
                        logger.error("Provided shortname was too long! Shortnames have a maximum of 9 characters.");
                        logger.error(`Trimming ${itemInfo["ShortName"]} to ${itemInfo["ShortName"].substring(0, 9)}`);
                        itemInfo["ShortName"] = itemInfo["ShortName"].substring(0, 9);
                    }
                    
                    localeDatabase[itemShortName] = itemInfo["ShortName"];
                }

                if (itemInfo["Description"] != "" && itemDescription in localeDatabase) {
                    localeDatabase[itemDescription] = itemInfo["Description"];
                }
            }
        }

        if (!this.debug) return;

        for (const itemId in itemDatabase) {
            const item = itemDatabase[itemId];
            if (item._type != ItemType.ITEM) continue;

            if (item._parent == "5485a8684bdc2da71d8b4567" || item._parent == "543be5cb4bdc2deb348b4568") {
                const handbookItem = handbookDatabase.Items.find((i) => i.Id === item._id);
                if (handbookItem == undefined) {
                    continue;
                }
                if (!(item._id in this.modConfig["items"]) && item._name.toLowerCase().indexOf("shrapnel") == -1 && item._name.toLowerCase().indexOf("patron_rsp") == -1 && item._name.toLowerCase().indexOf("patron_26x75") == -1) {
                    if ("ammoType" in item._props) {
                        if (item._props.ammoType != "bullet" && item._props.ammoType != "grenade") continue;
                    }


                    logger.info(`Item ${item._name} was not in list. tpl: ${item._id}`);

                    const itemName = item._id + " Name";
                    const itemShortName = item._id + " ShortName";

                    this.modConfig["items"][item._id] = {
                        "Name": `FIXME ${localeDatabase[itemName]}`,
                        "ShortName": localeDatabase[itemShortName],
                        "Description": ""
                    };
                }
            }
        }
        vfs.writeFile(path.resolve(__dirname, "../config/config.json"), JSON.stringify(this.modConfig, null, 4));
    }
}

module.exports = { mod: new EasyAmmoNames() };
