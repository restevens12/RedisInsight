import { t, Selector, ClientFunction } from 'testcafe';
import { Common } from '../helpers/common';
import { BrowserPage } from '../pageObjects';

const common = new Common();
const browserPage = new BrowserPage();
const getPageUrl = ClientFunction(() => window.location.href);

export class CliPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    cliExpandButton = Selector('[data-testid=expand-cli]');
    cliCollapseButton = Selector('[data-testid=close-cli]');
    expandCommandHelperButton = Selector('[data-testid=expand-command-helper]');
    closeCommandHelperButton = Selector('[data-testid=close-command-helper]');
    filterGroupTypeButton = Selector('[data-testid=select-filter-group-type]');
    filterOptionGroupType = Selector('[data-test-subj^=filter-option-group-type-]');
    readMoreButton = Selector('[data-testid=read-more]');
    minimizeCliButton = Selector('[data-testid=hide-cli]');
    minimizeCommandHelperButton = Selector('[data-testid=hide-command-helper]');
    cliBadge = Selector('[data-testid=expand-cli] span');
    commandHelperBadge = Selector('[data-testid=expand-command-helper] span');
    cliResizeButton = Selector('[data-test-subj=resize-btn-browser-cli]');
    //TEXT INPUTS (also referred to as 'Text fields')
    cliCommandInput = Selector('[data-testid=cli-command]');
    cliArea = Selector('[data-testid=cli');
    cliHelperSearch = Selector('[data-testid=cli-helper-search]');
    //TEXT ELEMENTS
    cliHelper = Selector('[data-testid=cli-helper]');
    cliHelperText = Selector('[data-testid=cli-helper-default]');
    cliOutputResponseSuccess = Selector('[data-testid=cli-output-response-success]');
    cliOutputResponseFail = Selector('[data-testid=cli-output-response-fail]');
    cliHelperOutputTitles = Selector('[data-testid^=cli-helper-output-title-]');
    cliHelperTitle = Selector('[data-testid=cli-helper-title]');
    cliHelperTitleArgs = Selector('[data-testid=cli-helper-title-args]');
    cliHelperSummary = Selector('[data-testid=cli-helper-summary]');
    cliHelperArguments = Selector('[data-testid=cli-helper-arguments]');
    cliHelperComplexity = Selector('[data-testid=cli-helper-complexity]');
    cliCommandAutocomplete = Selector('[data-testid=cli-command-autocomplete]');
    cliCommandExecuted = Selector('[data-testid=cli-command-wrapper]');
    cliReadMoreJSONCommandDocumentation = Selector('[id=jsonset]');
    cliReadMoreRediSearchCommandDocumentation = Selector('[id=ftexplain]');
    commandHelperArea = Selector('[data-testid=command-helper]');
    cliEndpoint = Selector('[data-testid^=cli-endpoint]');
    cliDbIndex = Selector('[data-testid=cli-db-index]');

    /**
  * Select filter group type
  * @param groupName The group name
  */
    async selectFilterGroupType(groupName: string): Promise<void>{
        await t.click(this.filterGroupTypeButton);
        await t.click(this.filterOptionGroupType.withExactText(groupName));
    }

    /**
   * Add keys from CLI
   * @param keyCommand The command from cli to add key
   * @param amount The amount of the keys
   * @param keyName The name of the keys. The default value is keyName
   */
    async addKeysFromCli(keyCommand: string, amount: number, keyName = 'keyName'): Promise<void>{
        //Open CLI
        await t.click(this.cliExpandButton);
        //Add keys
        const keyValueArray = await common.createArrayWithKeyValueAndKeyname(amount, keyName);
        await t.typeText(this.cliCommandInput, `${keyCommand} ${keyValueArray.join(' ')}`, { paste: true });
        await t.pressKey('enter');
        await t.click(this.cliCollapseButton);
    }

    /**
   * Send command in Cli
   * @param command The command to send
   */
    async sendCommandInCli(command: string): Promise<void>{
        //Open CLI
        await t.click(this.cliExpandButton);
        await t.typeText(this.cliCommandInput, command, { paste: true });
        await t.pressKey('enter');
        await t.click(this.cliCollapseButton);
    }

    /**
   * Get command result execution
   * @param command The command for send in CLI
   */
    async getSuccessCommandResultFromCli(command: string): Promise<string>{
        //Open CLI
        await t.click(this.cliExpandButton);
        //Add keys
        await t.typeText(this.cliCommandInput, command, { paste: true });
        await t.pressKey('enter');
        const commandResult = await this.cliOutputResponseSuccess.innerText;
        await t.click(this.cliCollapseButton);
        return commandResult;
    }

    /**
   * Send command in Cli and wait for total keys after 5 seconds
   * @param command The command to send
   */
    async sendCliCommandAndWaitForTotalKeys(command: string): Promise<string> {
        await this.sendCommandInCli(command);
        //Wait 5 seconds and return total keys
        await t.wait(5000);
        return await browserPage.overviewTotalKeys.innerText;
    }

    /**
     * Check URL of command opened from command helper
     * @param command The command for which to open Read more link
     * @param url Command URL for external resourse
     */
    async checkURLCommand(command: string, url: string): Promise<void> {
        await t.click(this.cliHelperOutputTitles.withExactText(command));
        await t.click(this.readMoreButton);
        await t.expect(getPageUrl()).eql(url, 'The opened page');
    }

    /**
     * Check URL of command opened from command helper
     * @param searchedCommand Searched command in Command Helper
     * @param listToCompare The list with commands to compare with opened in Command Helper
     */
    async checkSearchedCommandInCommandHelper(searchedCommand: string, listToCompare: string[]): Promise<void> {
        await t.typeText(this.cliHelperSearch, searchedCommand, { speed: 0.5 });
        //Verify results in the output
        const commandsCount = await this.cliHelperOutputTitles.count;
        for (let i = 0; i < commandsCount; i++) {
            await t.expect(this.cliHelperOutputTitles.nth(i).textContent).eql(listToCompare[i], 'Results in the output contains searched value');
        }
    }
}
