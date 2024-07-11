import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { LocaleService } from "@spt/services/LocaleService";
import { ItemType } from "@spt/models/eft/common/tables/ITemplateItem";

class EasyAmmoNames implements IPostDBLoadMod {
    private modConfig = require("../config/config.json");
    private debug = false;

    postDBLoad(container: DependencyContainer): void {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const localeService = container.resolve<LocaleService>("LocaleService");
        const itemDatabase = databaseServer.getTables().templates.items;
        const localeDatabase = localeService.getLocaleDb();

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

            if (item._parent == "5485a8684bdc2da71d8b4567") {
                if (!(item._id in this.modConfig["items"]) && item._props.ammoType == "bullet" && item._name.toLowerCase().indexOf("shrapnel") == -1) {
                    logger.info(`Item ${item._name} was not in list. tpl: ${item._id}`);
                }
            }
        }
    }
}

module.exports = { mod: new EasyAmmoNames() };
