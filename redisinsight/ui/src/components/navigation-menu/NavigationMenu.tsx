/* eslint-disable react/no-this-in-sfc */
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import cx from 'classnames'
import { last } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiPageSideBar,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip
} from '@elastic/eui'

import { PageNames, Pages } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { getRouterLinkProps } from 'uiSrc/services'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appElectronInfoSelector, setReleaseNotesViewed, setShortcutsFlyoutState } from 'uiSrc/slices/app/info'
import LogoSVG from 'uiSrc/assets/img/logo.svg'
import SettingsSVG from 'uiSrc/assets/img/sidebar/settings.svg'
import SettingsActiveSVG from 'uiSrc/assets/img/sidebar/settings_active.svg'
import BrowserSVG from 'uiSrc/assets/img/sidebar/browser.svg'
import BrowserActiveSVG from 'uiSrc/assets/img/sidebar/browser_active.svg'
import WorkbenchSVG from 'uiSrc/assets/img/sidebar/workbench.svg'
import WorkbenchActiveSVG from 'uiSrc/assets/img/sidebar/workbench_active.svg'
import SlowLogSVG from 'uiSrc/assets/img/sidebar/slowlog.svg'
import SlowLogActiveSVG from 'uiSrc/assets/img/sidebar/slowlog_active.svg'
import GithubSVG from 'uiSrc/assets/img/sidebar/github.svg'
import Divider from 'uiSrc/components/divider/Divider'

import { BuildType } from 'uiSrc/constants/env'
import styles from './styles.module.scss'

const workbenchPath = `/${PageNames.workbench}`
const browserPath = `/${PageNames.browser}`
const slowLogPath = `/${PageNames.slowLog}`

interface INavigations {
  isActivePage: boolean;
  tooltipText: string;
  ariaLabel: string;
  dataTestId: string;
  connectedInstanceId?: string;
  onClick: () => void;
  getClassName: () => string;
  getIconType: () => string;
}

interface IProps {
  buildType: BuildType
}

const NavigationMenu = ({ buildType }: IProps) => {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  const [activePage, setActivePage] = useState(Pages.home)
  const [isHelpMenuActive, setIsHelpMenuActive] = useState(false)

  const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
  const { isReleaseNotesViewed } = useSelector(appElectronInfoSelector)

  useEffect(() => {
    setActivePage(`/${last(location.pathname.split('/'))}`)
  }, [location])

  const handleGoSettingsPage = () => {
    history.push(Pages.settings)
  }
  const handleGoWorkbenchPage = () => {
    history.push(Pages.workbench(connectedInstanceId))
  }
  const handleGoBrowserPage = () => {
    history.push(Pages.browser(connectedInstanceId))
  }
  const handleGoSlowLogPage = () => {
    history.push(Pages.slowLog(connectedInstanceId))
  }

  const onKeyboardShortcutClick = () => {
    setIsHelpMenuActive(false)
    dispatch(setShortcutsFlyoutState(true))
  }

  const privateRoutes: INavigations[] = [
    {
      tooltipText: 'Browser',
      isActivePage: activePage === browserPath,
      ariaLabel: 'Browser page button',
      onClick: handleGoBrowserPage,
      dataTestId: 'browser-page-btn',
      connectedInstanceId,
      getClassName() {
        return cx(styles.navigationButton, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? BrowserSVG : BrowserActiveSVG
      },
    },
    {
      tooltipText: 'Workbench',
      ariaLabel: 'Workbench page button',
      onClick: handleGoWorkbenchPage,
      dataTestId: 'workbench-page-btn',
      connectedInstanceId,
      isActivePage: activePage === workbenchPath,
      getClassName() {
        return cx(styles.navigationButton, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? WorkbenchSVG : WorkbenchActiveSVG
      },
    },
    {
      tooltipText: 'Slow Log',
      ariaLabel: 'SlowLog page button',
      onClick: handleGoSlowLogPage,
      dataTestId: 'slowlog-page-btn',
      connectedInstanceId,
      isActivePage: activePage === slowLogPath,
      getClassName() {
        return cx(styles.navigationButton, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? SlowLogActiveSVG : SlowLogSVG
      },
    },
  ]

  const publicRoutes: INavigations[] = [
    {
      tooltipText: 'Settings',
      ariaLabel: 'Settings page button',
      onClick: handleGoSettingsPage,
      dataTestId: 'settings-page-btn',
      isActivePage: activePage === Pages.settings,
      getClassName() {
        return cx(styles.navigationButton, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? SettingsActiveSVG : SettingsSVG
      },
    },
  ]

  const onClickReleaseNotes = async () => {
    if (isReleaseNotesViewed === false) {
      dispatch(setReleaseNotesViewed(true))
    }
  }

  const HelpMenuButton = () => (
    <EuiButtonIcon
      className={
        cx(styles.navigationButton, { [styles.navigationButtonNotified]: isReleaseNotesViewed === false })
      }
      iconType="questionInCircle"
      iconSize="l"
      aria-label="Help Menu"
      onClick={() => setIsHelpMenuActive((value) => !value)}
      data-testid="help-menu-button"
    />
  )

  const HelpMenu = () => (
    <EuiPopover
      anchorPosition="rightUp"
      isOpen={isHelpMenuActive}
      anchorClassName={styles.unsupportedInfo}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popoverWrapper)}
      closePopover={() => setIsHelpMenuActive(false)}
      button={(
        <>
          {!isHelpMenuActive && (
          <EuiToolTip content="Help" position="right" key="help-menu">
            {HelpMenuButton()}
          </EuiToolTip>
          )}

          {isHelpMenuActive && HelpMenuButton()}
        </>
        )}
    >
      <div className={styles.popover} data-testid="help-center">
        <EuiTitle size="xs">
          <span>Help Center</span>
        </EuiTitle>
        <EuiSpacer size="l" />
        <EuiFlexGroup className={styles.helpMenuItems} responsive={false}>
          <EuiFlexItem className={styles.helpMenuItem}>
            <EuiLink
              external={false}
              className={styles.helpMenuItemLink}
              href={EXTERNAL_LINKS.githubIssues}
              target="_blank"
              data-testid="submit-bug-btn"
            >
              <EuiIcon type="flag" size="xl" />
              <EuiSpacer size="s" />
              <EuiText size="xs" textAlign="center" className={styles.helpMenuText}>
                Submit a Bug or Idea
              </EuiText>
            </EuiLink>
          </EuiFlexItem>

          <EuiFlexItem
            className={styles.helpMenuItem}
            onClick={() => onKeyboardShortcutClick()}
            data-testid="shortcuts-btn"
          >
            <div className={styles.helpMenuItemLink}>
              <EuiIcon type="keyboardShortcut" size="xl" />
              <EuiSpacer size="s" />
              <EuiText
                size="xs"
                textAlign="center"
                className={styles.helpMenuText}
              >
                Keyboard Shortcuts
              </EuiText>
            </div>
          </EuiFlexItem>

          <EuiFlexItem className={styles.helpMenuItem}>
            <EuiLink
              external={false}
              className={styles.helpMenuItemLink}
              onClick={onClickReleaseNotes}
              href={EXTERNAL_LINKS.releaseNotes}
              target="_blank"
              data-testid="release-notes-btn"
            >
              <div className={cx({ [styles.helpMenuItemNotified]: isReleaseNotesViewed === false })}>
                <EuiIcon type="package" size="xl" />
              </div>
              <EuiSpacer size="s" />
              <EuiText size="xs" textAlign="center" className={styles.helpMenuText}>Release Notes</EuiText>
            </EuiLink>
          </EuiFlexItem>

        </EuiFlexGroup>
      </div>
    </EuiPopover>
  )

  return (
    <EuiPageSideBar aria-label="Main navigation" className={cx(styles.navigation, 'eui-yScroll')}>
      <div className={styles.container}>
        <EuiToolTip
          content={buildType === BuildType.RedisStack ? 'Edit database' : 'My Redis databases'}
          position="right"
        >
          <span className={cx(styles.iconNavItem, styles.homeIcon)}>
            <EuiLink {...getRouterLinkProps(Pages.home)} data-test-subj="home-page-btn">
              <EuiIcon aria-label="redisinsight home page" type={LogoSVG} />
            </EuiLink>
          </span>
        </EuiToolTip>

        {connectedInstanceId && (
          privateRoutes.map((nav) => (
            <EuiToolTip content={nav.tooltipText} position="right" key={nav.tooltipText}>
              <EuiButtonIcon
                className={nav.getClassName()}
                iconType={nav.getIconType()}
                aria-label={nav.ariaLabel}
                onClick={nav.onClick}
                data-testid={nav.dataTestId}
              />
            </EuiToolTip>
          ))
        )}
      </div>
      <div className={styles.bottomContainer}>
        {HelpMenu()}
        {publicRoutes.map((nav) => (
          <EuiToolTip content={nav.tooltipText} position="right" key={nav.tooltipText}>
            <EuiButtonIcon
              className={nav.getClassName()}
              iconType={nav.getIconType()}
              aria-label={nav.ariaLabel}
              onClick={nav.onClick}
              data-testid={nav.dataTestId}
            />
          </EuiToolTip>
        ))}
        <Divider colorVariable="separatorNavigationColor" className="eui-hideFor--xs eui-hideFor--s" variant="middle" />
        <Divider
          colorVariable="separatorNavigationColor"
          className="eui-showFor--xs--flex eui-showFor--s--flex"
          variant="middle"
          orientation="vertical"
        />
        <EuiToolTip
          content="RedisInsight Repository"
          position="right"
        >
          <span className={cx(styles.iconNavItem, styles.githubLink)}>
            <EuiLink
              external={false}
              href={EXTERNAL_LINKS.githubRepo}
              target="_blank"
              data-test-subj="github-repo-btn"
            >
              <EuiIcon
                className={styles.githubIcon}
                aria-label="redis insight github repository"
                type={GithubSVG}
                data-testid="github-repo-icon"
              />
            </EuiLink>
          </span>
        </EuiToolTip>
      </div>
    </EuiPageSideBar>
  )
}

export default NavigationMenu
