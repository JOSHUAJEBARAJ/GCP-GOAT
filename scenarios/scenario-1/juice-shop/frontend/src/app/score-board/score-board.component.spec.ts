/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatDividerModule } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button'
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'
import { NgxSpinnerModule } from 'ngx-spinner'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { ScoreBoardComponent } from './score-board.component'
import { of, throwError } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { EventEmitter } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { ChallengeStatusBadgeComponent } from '../challenge-status-badge/challenge-status-badge.component'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { LocalBackupService } from '../Services/local-backup.service'
import { ActivatedRoute, RouterModule } from '@angular/router'
class MockSocket {
  on (str: string, callback: Function) {
    callback(str)
  }
}

describe('ScoreBoardComponent', () => {
  let component: ScoreBoardComponent
  let fixture: ComponentFixture<ScoreBoardComponent>
  let challengeService: any
  let configurationService: any
  let localBackupService: any
  let translateService: any
  let codeSnippetService: any
  let sanitizer: any
  let socketIoService: any
  let mockSocket: any

  beforeEach(waitForAsync(() => {
    challengeService = jasmine.createSpyObj('ChallengeService', ['find'])
    challengeService.find.and.returnValue(of([{}]))
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: {} }))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    codeSnippetService = jasmine.createSpyObj('CodeSnippetService', ['challenges'])
    codeSnippetService.challenges.and.returnValue(of([]))
    sanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml', 'sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.callFake((args: any) => args)
    sanitizer.sanitize.and.returnValue({})
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),

        BrowserAnimationsModule,
        NgxSpinnerModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatDividerModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatIconModule,
        MatSnackBarModule,
        MatChipsModule,
        MatDialogModule,
        RouterModule.forRoot([])
      ],
      declarations: [ScoreBoardComponent, ChallengeStatusBadgeComponent],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: CodeSnippetService, useValue: codeSnippetService },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: DomSanitizer, useValue: sanitizer },
        { provide: LocalBackupService, useValue: localBackupService },
        { provide: SocketIoService, useValue: socketIoService },
        {
 provide: ActivatedRoute,
useValue: {
 snapshot: {
          queryParams: { challenge: 'value' }
        }
}
}
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreBoardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold existing challenges', () => {
    challengeService.find.and.returnValue(of([{ description: 'XSS' }, { description: 'XXE' }]))
    component.ngOnInit()
    expect(component.challenges.length).toBe(2)
    expect(component.challenges[0].description).toBe('XSS')
    expect(component.challenges[1].description).toBe('XXE')
  })

  it('should log the error on retrieving configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  })

  it('should be able to toggle the difficulty and save it in localStorage', () => {
    component.displayedDifficulties = []
    spyOn(localStorage, 'setItem')
    component.toggleDifficulty(2)
    expect(component.displayedDifficulties).toEqual([2])
    expect(localStorage.setItem).toHaveBeenCalledWith('displayedDifficulties', JSON.stringify(component.displayedDifficulties))
  })

  it('should consider challenge description as trusted HTML', () => {
    challengeService.find.and.returnValue(of([{ description: '<a src="link">Link</a>' }]))
    component.ngOnInit()
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<a src="link">Link</a>')
  })

  it('should calculate percent of challenges solved', () => {
    challengeService.find.and.returnValue(of([{ solved: true }, { solved: true }, { solved: false }]))
    component.ngOnInit()
    expect(component.percentChallengesSolved).toBe('67')
  })

  it('should calculate percent of coding challenges solved', () => {
    challengeService.find.and.returnValue(of([{ key: 'c1', codingChallengeStatus: 0 }, { key: 'c2', codingChallengeStatus: 1 }, { key: 'c3', codingChallengeStatus: 2 }, { key: 'c4' }, { key: 'c5', codingChallengeStatus: 0 }]))
    codeSnippetService.challenges.and.returnValue(of(['c1', 'c2', 'c3', 'c5']))
    component.ngOnInit()
    expect(component.percentCodingChallengesSolved).toBe('38')
  })

  it('should hold nothing when no challenges exists', () => {
    challengeService.find.and.returnValue(of([]))
    component.ngOnInit()
    expect(component.challenges).toEqual([])
  })

  xit('should hold nothing on error from backend API and log the error', fakeAsync(() => { // FIXME Error: 1 timer(s) still in the queue.
    challengeService.find.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(component.challenges).toEqual([])
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should solve the score board challenge if it is solved', () => {
    challengeService.find.and.returnValue(of([{ name: 'Score Board', solved: false }]))
    component.ngOnInit()
    expect(component.challenges[0].solved).toBe(true)
  })

  it('should return an empty array if challenges are empty while filtering challenges by difficulty', () => {
    component.challenges = []
    component.populateFilteredChallengeLists()
    expect(component.totalChallengesOfDifficulty[0]).toEqual([])
    expect(component.totalChallengesOfDifficulty[1]).toEqual([])
    expect(component.totalChallengesOfDifficulty[2]).toEqual([])
    expect(component.totalChallengesOfDifficulty[3]).toEqual([])
    expect(component.totalChallengesOfDifficulty[4]).toEqual([])
    expect(component.totalChallengesOfDifficulty[5]).toEqual([])
  })

  it('should return an empty array if challenges are empty while filtering solved challenges by difficulty', () => {
    component.challenges = []
    component.populateFilteredChallengeLists()
    expect(component.solvedChallengesOfDifficulty[0]).toEqual([])
    expect(component.solvedChallengesOfDifficulty[1]).toEqual([])
    expect(component.solvedChallengesOfDifficulty[2]).toEqual([])
    expect(component.solvedChallengesOfDifficulty[3]).toEqual([])
    expect(component.solvedChallengesOfDifficulty[4]).toEqual([])
    expect(component.solvedChallengesOfDifficulty[5]).toEqual([])
  })

  it('should complete a level when all challenges of that difficulty are solved', () => {
    challengeService.find.and.returnValue(of([{ solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }]))
    component.ngOnInit()
    expect(component.offsetValue[2]).toBe('0%')
  })

  it('should update the correct challenge when a challenge solved event occurs', () => {
    challengeService.find.and.returnValue(of([{ name: 'Challenge #1', solved: false }, { name: 'Challenge #2', solved: false }]))
    spyOn(mockSocket, 'on')
    component.ngOnInit()
    const triggerChallengeSolvedEvent = mockSocket.on.calls.argsFor(0)[1]
    triggerChallengeSolvedEvent({ challenge: 'ping', name: 'Challenge #1' })
    expect(component.challenges[0].solved).toBe(true)
    expect(component.challenges[1].solved).toBe(false)
  })

  it('should not update when a challenge solved event to a nonexistent challenge occurs', () => {
    challengeService.find.and.returnValue(of([{ name: 'Challenge #1', solved: false }, { name: 'Challenge #2', solved: false }]))
    spyOn(mockSocket, 'on')
    component.ngOnInit()
    const triggerChallengeSolvedEvent = mockSocket.on.calls.argsFor(0)[1]
    triggerChallengeSolvedEvent({ challenge: 'ping', name: 'Challenge #1337' })
    expect(component.challenges[0].solved).toBe(false)
    expect(component.challenges[1].solved).toBe(false)
  })

  it('should be possible when challenge-solved notifications are shown with CTF flag codes', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ ctf: { showFlagsInNotifications: true }, application: {}, challenges: { showSolvedNotifications: true } }))
    component.ngOnInit()
    expect(component.allowRepeatNotifications).toBe(true)
  })

  it('should not be possible when challenge-solved notifications are shown without CTF flag codes', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ ctf: { showFlagsInNotifications: false }, application: {}, challenges: { showSolvedNotifications: true } }))
    component.ngOnInit()
    expect(component.allowRepeatNotifications).toBe(false)
  })

  it('should not be possible when challenge-solved notifications are not shown', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showSolvedNotifications: false } }))
    component.ngOnInit()
    expect(component.allowRepeatNotifications).toBe(false)
  })

  it('should show notification for selected challenge when enabled', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ ctf: { showFlagsInNotifications: true }, application: {}, challenges: { showSolvedNotifications: true } }))
    component.ngOnInit()
    expect(component.allowRepeatNotifications).toBeTruthy()
  })

  it('should not happen when hints are not turned on in configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showHints: false } }))
    component.ngOnInit()
    expect(component.showChallengeHints).toBeFalsy()
  })

  it('should be empty for challenge with neither hint text nor URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showHints: true } }))
    challengeService.find.and.returnValue(of([{ name: 'Challenge' }]))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBeUndefined()
  })

  it('should remain unchanged for challenge with a hint text but no hint URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showHints: true } }))
    challengeService.find.and.returnValue(of([{ name: 'Challenge', hint: 'Hint' }]))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBe('Hint')
  })

  it('should append click-me text for challenge with a hint text and URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showHints: true } }))
    challengeService.find.and.returnValue(of([{ name: 'Challenge', hint: 'Hint.', hintUrl: 'http://hi.nt' }]))
    translateService.get.and.returnValue(of('CLICK_FOR_MORE_HINTS'))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBe('Hint. CLICK_FOR_MORE_HINTS')
  })

  it('should become click-me text for challenge without a hint text but with hint URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showHints: true } }))
    translateService.get.and.returnValue(of('CLICK_TO_OPEN_HINTS'))
    challengeService.find.and.returnValue(of([{ name: 'Challenge', hintUrl: 'http://hi.nt' }]))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBe('CLICK_TO_OPEN_HINTS')
  })

  it('should become unavailability text for challenge which is disabled', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showHints: true } }))
    translateService.get.and.returnValue(of('CHALLENGE_UNAVAILABLE'))
    challengeService.find.and.returnValue(of([{ name: 'Challenge', hint: 'Hint', disabledEnv: 'Heroku' }]))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBe('CHALLENGE_UNAVAILABLE')
  })

  it('should show GitHub info box if so configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { showGitHubLinks: true }, challenges: {} }))
    component.ngOnInit()
    expect(component.showContributionInfoBox).toBe(true)
  })

  it('should hide GitHub info box if so configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { showGitHubLinks: false }, challenges: {} }))
    component.ngOnInit()
    expect(component.showContributionInfoBox).toBe(false)
  })

  it('should show GitHub button by default', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: {} }))
    component.ngOnInit()
    expect(component.showHackingInstructor).toBeFalsy()
  })

  it('should offer Hacking Instructor if so configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: {}, hackingInstructor: { isEnabled: true } }))
    component.ngOnInit()
    expect(component.showHackingInstructor).toBeTruthy()
  })

  it('should not show feedback button column if so configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showFeedbackButtons: false } }))
    component.ngOnInit()
    expect(component.displayedColumns).not.toContain('feedback')
  })

  it('should show feedback button column if so configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: { showFeedbackButtons: true } }))
    component.ngOnInit()
    expect(component.displayedColumns).toContain('feedback')
  })

  it('should sort challenges by tutorial order when in tutorial mode', () => {
    challengeService.find.and.returnValue(of([{ tutorialOrder: 2 }, { tutorialOrder: 3 }, { tutorialOrder: 1 }, { }]))
    localStorage.setItem('showOnlyTutorialChallenges', 'true')
    component.ngOnInit()
    expect(component.challenges[0].tutorialOrder).toBe(1)
    expect(component.challenges[1].tutorialOrder).toBe(2)
    expect(component.challenges[2].tutorialOrder).toBe(3)
    expect(component.challenges[3].tutorialOrder).toBeUndefined()
  })

  it('hint text is augmented with unavailbaility notice for disabled challenges', () => {
  })

  it('augmenting hint text of disabled challenge increases counter of disabled challenges', () => {
    component.numDisabledChallenges = 0
    component.augmentHintText({ disabledEnv: 'Heroku' } as any)
    expect(component.numDisabledChallenges).toBe(1)
  })

  it('hint text is augmented with unavailbaility notice for disabled challenges', () => {
    component.augmentHintText({ disabledEnv: 'Heroku' } as any)
    expect(component.disabledEnv).toBe('Heroku')
  })

  it('stays on lowest tutorial tier with unsolved challenges', () => {
    component.calculateTutorialTier([{ tutorialOrder: 1, difficulty: 1, solved: true }, { tutorialOrder: 2, difficulty: 2, solved: true }, { tutorialOrder: 3, difficulty: 2, solved: false }, { tutorialOrder: 4, difficulty: 3, solved: false }] as any)
    expect(component.tutorialsTier).toBe(2)
    expect(component.isLastTutorialsTier).toBeFalse()
  })

  it('jumps to next tutorial tier if all tutorial challenges of previous tier are solved', () => {
    component.calculateTutorialTier([{ tutorialOrder: 1, difficulty: 1, solved: true }, { tutorialOrder: 2, difficulty: 2, solved: true }, { tutorialOrder: 3, difficulty: 2, solved: true }, { tutorialOrder: 4, difficulty: 3, solved: false }] as any)
    expect(component.tutorialsTier).toBe(3)
    expect(component.isLastTutorialsTier).toBeTrue()
  })

  it('will not unlock entire Score Board as long as unsolved tutorials exist', () => {
    component.calculateTutorialTier([{ tutorialOrder: 1, difficulty: 1, solved: true }, { tutorialOrder: 2, difficulty: 2, solved: true }, { tutorialOrder: 3, difficulty: 2, solved: true }, { tutorialOrder: 4, difficulty: 3, solved: false }] as any)
    expect(component.allTutorialsCompleted).toBeFalse()
  })

  it('will unlock entire Score Board when all tutorials are solved', () => {
    component.calculateTutorialTier([{ tutorialOrder: 1, difficulty: 1, solved: true }, { tutorialOrder: 2, difficulty: 2, solved: true }, { tutorialOrder: 3, difficulty: 2, solved: true }, { tutorialOrder: 4, difficulty: 3, solved: true }] as any)
    expect(component.allTutorialsCompleted).toBeTrue()
  })

  it('Toggling all difficulties filter will turn on all difficulties when currently less than 50% of difficulties are toggled', () => {
    component.toggledMajorityOfDifficulties = false
    component.toggleAllDifficulty()
    expect(component.displayedDifficulties).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('Toggling all difficulties filter will turn off all difficulties when currently more than 50% of difficulties are toggled', () => {
    component.toggledMajorityOfDifficulties = true
    component.toggleAllDifficulty()
    expect(component.displayedDifficulties).toEqual([])
  })
})
