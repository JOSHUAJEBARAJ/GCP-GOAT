/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { MatTableDataSource } from '@angular/material/table'
import { DomSanitizer } from '@angular/platform-browser'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { NgxSpinnerService } from 'ngx-spinner'
import { ActivatedRoute } from '@angular/router'

import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faStar, faTrophy, faPollH } from '@fortawesome/free-solid-svg-icons'
import { faGem } from '@fortawesome/free-regular-svg-icons'
import { faBtc, faGithub, faGitter } from '@fortawesome/free-brands-svg-icons'
import { Challenge } from '../Models/challenge.model'
import { TranslateService } from '@ngx-translate/core'
import { LocalBackupService } from '../Services/local-backup.service'
import { MatDialog } from '@angular/material/dialog'
import { CodeSnippetComponent } from '../code-snippet/code-snippet.component'
import { CodeSnippetService } from '../Services/code-snippet.service'

library.add(faStar, faGem, faGitter, faGithub, faBtc, faTrophy, faPollH)
dom.watch()

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss']
})
export class ScoreBoardComponent implements OnInit, AfterViewInit {
  public availableDifficulties: number[] = [1, 2, 3, 4, 5, 6]
  public displayedDifficulties: number[] = [1]
  public availableChallengeCategories: string[] = []
  public displayedChallengeCategories: string[] = []
  public toggledMajorityOfDifficulties: boolean = false
  public toggledMajorityOfCategories: boolean = true
  public showSolvedChallenges: boolean = true
  public numDisabledChallenges: number = 0
  public showDisabledChallenges: boolean = false
  public showOnlyTutorialChallenges: boolean = false
  public restrictToTutorialsFirst: boolean = false
  public allTutorialsCompleted: boolean = false
  public isLastTutorialsTier: boolean = false
  public tutorialsTier: number = 1
  public disabledEnv?: string
  public displayedColumns = ['name', 'difficulty', 'description', 'category', 'tags', 'status']
  public offsetValue = ['100%', '100%', '100%', '100%', '100%', '100%']
  public allowRepeatNotifications: boolean = false
  public showChallengeHints: boolean = true
  public showVulnerabilityMitigations: boolean = true
  public codingChallengesEnabled: string = 'solved'
  public showHackingInstructor: boolean = true
  public challenges: Challenge[] = []
  public percentChallengesSolved: string = '0'
  public percentCodingChallengesSolved: string = '0'
  public solvedChallengesOfDifficulty: Challenge[][] = [[], [], [], [], [], []]
  public totalChallengesOfDifficulty: Challenge[][] = [[], [], [], [], [], []]
  public showContributionInfoBox: boolean = true
  public questionnaireUrl: string = 'https://forms.gle/2Tr5m1pqnnesApxN8'
  public appName: string = 'OWASP Juice Shop'
  public localBackupEnabled: boolean = true
  public showFeedbackButtons: boolean = true

  constructor (private readonly configurationService: ConfigurationService, private readonly challengeService: ChallengeService, private readonly codeSnippetService: CodeSnippetService, private readonly sanitizer: DomSanitizer, private readonly ngZone: NgZone, private readonly io: SocketIoService, private readonly spinner: NgxSpinnerService, private readonly translate: TranslateService, private readonly localBackupService: LocalBackupService, private readonly dialog: MatDialog, private readonly route: ActivatedRoute) {
  }

  public ngAfterViewInit () {
    const challenge: string = this.route.snapshot.queryParams.challenge

    if (challenge) {
      const target = document.getElementById(challenge)
      if (target) {
        this.scrollToChallenge(challenge)
      } else {
        const observer = new MutationObserver(mutationList => {
          for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
              const target = document.getElementById(challenge)
              if (target) {
                this.scrollToChallenge(challenge)
                observer.disconnect()
              }
            }
          }
        })
        observer.observe(document.body, { childList: true, subtree: true })
      }
    }
  }

  ngOnInit () {
    this.spinner.show()

    this.displayedDifficulties = localStorage.getItem('displayedDifficulties') ? JSON.parse(String(localStorage.getItem('displayedDifficulties'))) : [1]
    this.showSolvedChallenges = localStorage.getItem('showSolvedChallenges') ? JSON.parse(String(localStorage.getItem('showSolvedChallenges'))) : true
    this.showDisabledChallenges = localStorage.getItem('showDisabledChallenges') ? JSON.parse(String(localStorage.getItem('showDisabledChallenges'))) : false

    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      this.allowRepeatNotifications = config.challenges.showSolvedNotifications && config.ctf?.showFlagsInNotifications
      this.showChallengeHints = config.challenges.showHints
      this.showVulnerabilityMitigations = config.challenges.showMitigations
      this.codingChallengesEnabled = config.challenges.codingChallengesEnabled
      this.showHackingInstructor = config.hackingInstructor?.isEnabled
      this.showContributionInfoBox = config.application.showGitHubLinks
      this.showFeedbackButtons = config.challenges.showFeedbackButtons
      if (this.showFeedbackButtons) {
        this.displayedColumns.push('feedback')
      }
      this.questionnaireUrl = config.application.social?.questionnaireUrl
      this.appName = config.application.name
      this.restrictToTutorialsFirst = config.challenges.restrictToTutorialsFirst
      this.showOnlyTutorialChallenges = localStorage.getItem('showOnlyTutorialChallenges') ? JSON.parse(String(localStorage.getItem('showOnlyTutorialChallenges'))) : this.restrictToTutorialsFirst
      this.localBackupEnabled = config.application.localBackupEnabled
      this.challengeService.find({ sort: 'name' }).subscribe((challenges) => {
        this.codeSnippetService.challenges().subscribe((challengesWithCodeSnippet) => {
          this.challenges = challenges
          for (let i = 0; i < this.challenges.length; i++) {
            this.augmentHintText(this.challenges[i])
            this.trustDescriptionHtml(this.challenges[i])
            if (this.challenges[i].name === 'Score Board') {
              this.challenges[i].solved = true
            }
            if (!this.availableChallengeCategories.includes(challenges[i].category)) {
              this.availableChallengeCategories.push(challenges[i].category)
            }
            if (this.showHackingInstructor) {
              import(/* webpackChunkName: "tutorial" */ '../../hacking-instructor').then(module => {
                challenges[i].hasTutorial = module.hasInstructions(challenges[i].name)
              })
            }
            challenges[i].hasSnippet = challengesWithCodeSnippet.indexOf(challenges[i].key) > -1
          }
          this.availableChallengeCategories.sort((a, b) => a.localeCompare(b))
          this.displayedChallengeCategories = localStorage.getItem('displayedChallengeCategories') ? JSON.parse(String(localStorage.getItem('displayedChallengeCategories'))) : this.availableChallengeCategories
          this.calculateProgressPercentage()
          this.calculateCodingProgressPercentage()
          this.populateFilteredChallengeLists()
          this.calculateGradientOffsets(challenges)
          this.calculateTutorialTier(challenges)

          this.toggledMajorityOfDifficulties = this.determineToggledMajorityOfDifficulties()
          this.toggledMajorityOfCategories = this.determineToggledMajorityOfCategories()

          if (this.showOnlyTutorialChallenges) {
            this.challenges.sort((a, b) => {
              return a.tutorialOrder - b.tutorialOrder
            })
          }

          this.spinner.hide()
          })
      }, (err) => {
        this.challenges = []
        console.log(err)
      })
    }, (err) => console.log(err))

    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', (data: any) => {
        if (data?.challenge) {
          for (let i = 0; i < this.challenges.length; i++) {
            if (this.challenges[i].name === data.name) {
              this.challenges[i].solved = true
              break
            }
          }
          this.calculateProgressPercentage()
          this.populateFilteredChallengeLists()
          this.calculateGradientOffsets(this.challenges)
          this.calculateTutorialTier(this.challenges)
        }
      })
    })
  }

  scrollToChallenge (challengeName: string) {
      const el = document.getElementById(challengeName)
      if (!el) {
        console.log(`Challenge ${challengeName} is not visible!`)
      } else {
        console.log(`Scrolling to challenge: ${challengeName}`)
        el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  augmentHintText (challenge: Challenge) {
    if (challenge.disabledEnv) {
      this.numDisabledChallenges++
      this.disabledEnv = challenge.disabledEnv
      this.translate.get('CHALLENGE_UNAVAILABLE', { env: challenge.disabledEnv }).subscribe((challengeUnavailable) => {
        challenge.hint = challengeUnavailable
      }, (translationId) => {
        challenge.hint = translationId
      })
    } else if (challenge.hintUrl) {
      if (challenge.hint) {
        this.translate.get('CLICK_FOR_MORE_HINTS').subscribe((clickForMoreHints: string) => {
          challenge.hint += ` ${clickForMoreHints}`
        }, (translationId: string) => {
          challenge.hint += ` ${translationId}`
        })
      } else {
        this.translate.get('CLICK_TO_OPEN_HINTS').subscribe((clickToOpenHints) => {
          challenge.hint = clickToOpenHints
        }, (translationId) => {
          challenge.hint = translationId
        })
      }
    }
  }

  trustDescriptionHtml (challenge: Challenge) {
    challenge.description = this.sanitizer.bypassSecurityTrustHtml(challenge.description as string)
  }

  calculateCodingProgressPercentage () {
    let numCodingChallenges = 0
    let codingChallengeProgress = 0
    for (let i = 0; i < this.challenges.length; i++) {
      if (this.challenges[i].hasSnippet) {
        numCodingChallenges++
        codingChallengeProgress += this.challenges[i].codingChallengeStatus
      }
    }
    this.percentCodingChallengesSolved = (100 * codingChallengeProgress / (numCodingChallenges * 2)).toFixed(0)
  }

  calculateProgressPercentage () {
    let solvedChallenges = 0
    for (let i = 0; i < this.challenges.length; i++) {
      solvedChallenges += (this.challenges[i].solved) ? 1 : 0
    }
    this.percentChallengesSolved = (100 * solvedChallenges / this.challenges.length).toFixed(0)
  }

  calculateTutorialTier (challenges: Challenge[]) {
    this.allTutorialsCompleted = true
    this.isLastTutorialsTier = true
    this.tutorialsTier = 1

    for (let difficulty = 1; difficulty <= 6; difficulty++) {
      const challengesWithTutorial = challenges.filter((c) => c.tutorialOrder && c.difficulty === difficulty).length
      const solvedChallengesWithTutorial = challenges.filter((c) => c.tutorialOrder && c.difficulty === difficulty && c.solved).length
      this.allTutorialsCompleted = this.allTutorialsCompleted && challengesWithTutorial === solvedChallengesWithTutorial
      if (this.tutorialsTier === difficulty && challengesWithTutorial === solvedChallengesWithTutorial) this.tutorialsTier++
    }
    if (!this.allTutorialsCompleted) {
      this.isLastTutorialsTier = challenges.filter((c) => c.tutorialOrder && !c.solved && c.difficulty > this.tutorialsTier).length === 0
      for (let tier = 1; tier <= this.tutorialsTier; tier++) {
        if (!this.displayedDifficulties.includes(tier)) this.toggleDifficulty(this.tutorialsTier)
      }
    }
  }

  calculateGradientOffsets (challenges: Challenge[]) {
    for (let difficulty = 1; difficulty <= 6; difficulty++) {
      this.offsetValue[difficulty - 1] = this.calculateGradientOffset(challenges, difficulty)
    }
  }

  calculateGradientOffset (challenges: Challenge[], difficulty: number) {
    let solved = 0
    let total = 0

    for (let i = 0; i < challenges.length; i++) {
      if (challenges[i].difficulty === difficulty) {
        total++
        if (challenges[i].solved) {
          solved++
        }
      }
    }

    let offset: any = Math.round(solved * 100 / total)
    offset = 100 - offset
    return `${+offset}%`
  }

  toggleDifficulty (difficulty: number) {
    if (!this.displayedDifficulties.includes(difficulty)) {
      this.displayedDifficulties.push(difficulty)
    } else {
      this.displayedDifficulties = this.displayedDifficulties.filter((c) => c !== difficulty)
    }
    localStorage.setItem('displayedDifficulties', JSON.stringify(this.displayedDifficulties))
    this.toggledMajorityOfDifficulties = this.determineToggledMajorityOfDifficulties()
  }

  toggleAllDifficulty () {
    if (this.toggledMajorityOfDifficulties) {
      this.displayedDifficulties = []
      this.toggledMajorityOfDifficulties = false
    } else {
      this.displayedDifficulties = this.availableDifficulties
      this.toggledMajorityOfDifficulties = true
    }
    localStorage.setItem('displayedDifficulties', JSON.stringify(this.displayedDifficulties))
  }

  toggleShowSolvedChallenges () {
    this.showSolvedChallenges = !this.showSolvedChallenges
    localStorage.setItem('showSolvedChallenges', JSON.stringify(this.showSolvedChallenges))
  }

  toggleShowDisabledChallenges () {
    this.showDisabledChallenges = !this.showDisabledChallenges
    localStorage.setItem('showDisabledChallenges', JSON.stringify(this.showDisabledChallenges))
  }

  toggleShowOnlyTutorialChallenges () {
    this.showOnlyTutorialChallenges = !this.showOnlyTutorialChallenges
    localStorage.setItem('showOnlyTutorialChallenges', JSON.stringify(this.showOnlyTutorialChallenges))
    if (this.showOnlyTutorialChallenges) {
      this.challenges.sort((a, b) => {
        return a.tutorialOrder - b.tutorialOrder
      })
    } else {
      this.challenges.sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    }
  }

  toggleShowChallengeCategory (category: string) {
    if (!this.displayedChallengeCategories.includes(category)) {
      this.displayedChallengeCategories.push(category)
    } else {
      this.displayedChallengeCategories = this.displayedChallengeCategories.filter((c) => c !== category)
    }
    localStorage.setItem('displayedChallengeCategories', JSON.stringify(this.displayedChallengeCategories))
    this.toggledMajorityOfCategories = this.determineToggledMajorityOfCategories()
  }

  toggleAllChallengeCategory () {
    if (this.toggledMajorityOfCategories) {
      this.displayedChallengeCategories = []
      this.toggledMajorityOfCategories = false
    } else {
      this.displayedChallengeCategories = this.availableChallengeCategories
      this.toggledMajorityOfCategories = true
    }
    localStorage.setItem('displayedChallengeCategories', JSON.stringify(this.displayedChallengeCategories))
  }

  determineToggledMajorityOfDifficulties () {
    return this.displayedDifficulties.length > this.availableDifficulties.length / 2
  }

  determineToggledMajorityOfCategories () {
    return this.displayedChallengeCategories.length > this.availableChallengeCategories.length / 2
  }

  filterToDataSource (challenges: Challenge[]) {
    challenges = challenges.filter((challenge) => {
      if (!this.displayedDifficulties.includes(challenge.difficulty)) return false
      if (!this.displayedChallengeCategories.includes(challenge.category)) return false
      if (!this.showSolvedChallenges && challenge.solved) return false
      if (!this.showDisabledChallenges && challenge.disabledEnv) return false
      return !(this.showOnlyTutorialChallenges && !challenge.hasTutorial)
    })

    const dataSource = new MatTableDataSource()
    dataSource.data = challenges
    return dataSource
  }

  populateFilteredChallengeLists () {
    for (const difficulty of this.availableDifficulties) {
      if (this.challenges.length === 0) {
        this.totalChallengesOfDifficulty[difficulty - 1] = []
        this.solvedChallengesOfDifficulty[difficulty - 1] = []
      } else {
        this.totalChallengesOfDifficulty[difficulty - 1] = this.challenges.filter((challenge) => challenge.difficulty === difficulty)
        this.solvedChallengesOfDifficulty[difficulty - 1] = this.challenges.filter((challenge) => challenge.difficulty === difficulty && challenge.solved)
      }
    }
  }

  startHackingInstructor (challengeName: string) {
    console.log(`Starting instructions for challenge "${challengeName}"`)
    import(/* webpackChunkName: "tutorial" */ '../../hacking-instructor').then(module => {
      module.startHackingInstructorFor(challengeName)
    })
  }

  trackById (index: number, item: any) {
    return item.id
  }

  times (numberOfTimes: number) {
    return Array(numberOfTimes).fill('★')
  }

  saveBackup () {
    this.localBackupService.save(this.appName.toLowerCase().replace(/ /, '_'))
  }

  restoreBackup (file: File) {
    this.localBackupService.restore(file)
  }

  showCodeSnippet (key: string, name: string, codingChallengeStatus: number) {
    const dialogRef = this.dialog.open(CodeSnippetComponent, {
      disableClose: true,
      data: {
        key: key,
        name: name,
        codingChallengeStatus: codingChallengeStatus
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      for (const challenge of this.challenges) {
        if (challenge.name === name) {
          if (challenge.codingChallengeStatus < 1) {
            challenge.codingChallengeStatus = result.findIt ? 1 : challenge.codingChallengeStatus
          }
          if (challenge.codingChallengeStatus < 2) {
            challenge.codingChallengeStatus = result.fixIt ? 2 : challenge.codingChallengeStatus
          }
          this.calculateCodingProgressPercentage()
        }
      }
    })
  }

  generateColor (challenge: Challenge) {
    return challenge.codingChallengeStatus === 2 ? 'accent' : 'primary'
  }

  generateBadge (challenge: Challenge) {
    return challenge.codingChallengeStatus === 1 ? '1/2' : ''
  }
}
