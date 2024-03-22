import { DependencyContainer } from "tsyringe";

import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

class BulletRenamer implements IPostDBLoadMod
{
    private modConfig = require("../config/config.json");

    postDBLoad(container: DependencyContainer): void 
    {
        // const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const itemDatabase = databaseServer.getTables().templates.items;
        const localeDatabase = databaseServer.getTables().locales.global["en"];

        for (const itemTpl in this.modConfig["items"])
        {
            const itemInfo = this.modConfig["items"][itemTpl];
            
            if (itemTpl in itemDatabase)
            {
                const itemName = itemTpl + " Name";
                const itemShortName = itemTpl + " ShortName";
                const itemDescription = itemTpl + " Description";

                if (itemInfo["Name"] != "" && itemName in localeDatabase)
                {
                    localeDatabase[itemName] = itemInfo["Name"];
                }

                if (itemInfo["ShortName"] != "" && itemShortName in localeDatabase)
                {
                    localeDatabase[itemShortName] = itemInfo["ShortName"];
                }

                if (itemInfo["Description"] != "" && itemDescription in localeDatabase)
                {
                    localeDatabase[itemDescription] = itemInfo["Description"];
                }
            }
        }
    }
}

module.exports = { mod: new BulletRenamer() };
