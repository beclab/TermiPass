//
//  TermiPassFileTaskQueue.swift
//  VaultBaseFramework
//
//  Created by gjm on 8/15/23.
//

import Foundation
import Alamofire


public typealias TaskCompleteBlock = (_ task: inout TermiPassFileTask, _ result: Bool) -> Void
public typealias TaskProgressBlock = (_ task: inout TermiPassFileTask, _ progress: Float) -> Void

public let defaultConcurrency = 3
public let defaultRetrycount = 3
public let defaultAttempInterval = 60 //s
public let defaultCompleteInterval = 60 * 3 //s


public protocol TermiPassFileTask: NSObjectProtocol {
    
    var lastFinishTimestamp: TimeInterval { get set }
    
    var retryCount: Int { get set }
    
    var retryable: Bool { get set }
    
    func accountIdentifier() -> String
    func runable() -> Bool
    func name() -> String
    func run(completeBlock: TaskCompleteBlock) -> Void
    func cancel() -> Void
    func setTaskProgressBlock(taskProgressBlock: TaskProgressBlock) -> Void
    
    func cleanup() -> Void
    
    
    func taskIdentify() -> String
}


public class TermiPassFileTaskQueue: NSObject {
    
    public var concurrency: Int = defaultConcurrency
    public var attemptInterval: Double = Double(defaultAttempInterval)
    public var taskCompleteBlock: TaskCompleteBlock?
    public var taskProgressBlock: TaskProgressBlock?
    public var completedTasks: [TermiPassFileTask] = []
    
    public var taskNumber: Int {
        get {
            return self.tasks.count + self.ongoingTasks.count
        }
    }
    
    public var allTasks: [TermiPassFileTask] {
        get {
            let all = self.tasks + self.ongoingTasks
            return all
        }
    }
    
    public func addTask(_ task: inout TermiPassFileTask) {
        synchronized(self.tasks) {
            let taskContain = self.tasksContainTask(self.tasks, task)
            let ongoingContain = self.tasksContainTask(self.ongoingTasks, task)
            
            if !taskContain.0 && !ongoingContain.0 {
                task.lastFinishTimestamp = 0
                task.retryCount = 0
                self.tasks.append(task)
            }
        }
        
        tick()
    }
    
    public func removeTask(_ task: inout TermiPassFileTask) {
        task.retryable = false
        
        synchronized(self.tasks) {
            let taskContain = self.tasksContainTask(self.tasks, task)
            let ongoingContain = self.tasksContainTask(self.ongoingTasks, task)
            
            if taskContain.0 {
                self.tasks.remove(at: taskContain.1)
                return
            }
            
            if ongoingContain.0 {
                self.ongoingTasks.remove(at: taskContain.1)
            }
        }
    }
    
    public func clearTasks() {
        
        synchronized(self.tasks) {
            for var task in self.tasks {
                task.retryable = false
            }
            self.tasks = []
            
        }
        
        for var task in self.ongoingTasks {
            task.retryable = false
            task.cancel()
        }
        self.ongoingTasks = []
        
        self.completedTasks = []
        
        self.failedCount = 0
    }
    
    public func tick() {
        
        if self.failedCount > 0 {
            self.failedCount -= 1
        }
        
        self.performSelector(inBackground: #selector(runTasks), with: nil)
        self.performSelector(inBackground: #selector(removOldCompletedTask), with: nil)
    }
    
    @objc private func runTasks() {
        
        let isReachable = NetworkReachabilityManager.default?.isReachable ?? false
        
        if !isReachable || self.tasks.count == 0 {
            return
        }
        
        
        while self.ongoingTasks.count + self.failedCount < self.concurrency {
            guard let task = self.pickTask() else {
                break
            }
            
            synchronized(self.ongoingTasks) {
                self.ongoingTasks.append(task)
            }
            
            task.run(completeBlock: self.innerQueueTaskCompleteBlock)
            
        }
    }
    
    @objc private func removOldCompletedTask() {
        
        synchronized(self.completedTasks) {
            
            let newCompletedTasks = self.completedTasks.filter { task in
                return Double(Date().timeIntervalSince1970 - task.lastFinishTimestamp) <= Double(defaultCompleteInterval)
            }
            
            self.completedTasks = newCompletedTasks
        }
        
    }
    
    private func pickTask() -> TermiPassFileTask? {
        var runableTask: TermiPassFileTask?
        
        synchronized(self.tasks) {
            var position = -1
            for task in self.tasks {
                position += 1
                if task.runable() && task.lastFinishTimestamp < (Date().timeIntervalSince1970 - self.attemptInterval) && task.retryCount < defaultRetrycount {
                    runableTask = task
                    break
                }
            }
            
            if runableTask != nil {
                self.tasks.remove(at: position)
            }
        }
        
        return runableTask
    }
    
    private var tasks: [TermiPassFileTask] = []
    
    private var ongoingTasks: [TermiPassFileTask] = []
    
    private var failedCount: Int = 0
    
    lazy var innerQueueTaskCompleteBlock:TaskCompleteBlock = {[weak self] task, result in
        
        guard let strongSelf = self else {
            return
        }
        
        synchronized(strongSelf.ongoingTasks) {
            
            let result = strongSelf.tasksContainTask(strongSelf.ongoingTasks, task)
            
            if result.0 {
                strongSelf.ongoingTasks.remove(at: result.1)
            }
        }
        
        task.lastFinishTimestamp = Date().timeIntervalSince1970
        
        if !result {
            synchronized(strongSelf.tasks) {
                strongSelf.failedCount += 1
                if task.runable() {
                    task.retryCount += 1
                    strongSelf.tasks.append(task)
                }
            }
        } else {
            strongSelf.failedCount = 0
            synchronized(strongSelf.completedTasks) {
                
                let result = strongSelf.tasksContainTask(strongSelf.completedTasks, task)
                
                if !result.0 {
                    strongSelf.completedTasks.append(task)
                }
            }
            
            if let taskCompleteBlock = strongSelf.taskCompleteBlock {
                taskCompleteBlock(&task, result)
            }
            
            strongSelf.tick()
        }
    }
    
    private lazy var innerQueueTaskProgressBlock:TaskProgressBlock = {[weak self] task, progress in
        
        guard let strongSelf = self else {
            return
        }
        
        if let taskProgressBlock = strongSelf.taskProgressBlock {
            taskProgressBlock(&task, progress)
        }
    }
    
    private func tasksContainTask(_ taskList: [TermiPassFileTask], _ task: TermiPassFileTask) -> (Bool, Int) {
        var index = taskList.firstIndex(where: {
            $0.taskIdentify() == task.taskIdentify()
        })
        
        guard let index = index,index >= 0 else {
            return (false, -1)
        }
        
        return (true, index)
    }
    
}

@discardableResult
public func synchronized<T>(_ lock: Any, closure:() -> T) -> T {
    objc_sync_enter(lock)
    defer { objc_sync_exit(lock) }
    
    return closure()
}
