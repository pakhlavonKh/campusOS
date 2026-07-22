export interface DomainEventPayload {
    eventId: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    organizationId: string;
    occurredAt: string;
    version: number;
    metadata: {
        correlationId: string;
        causationId: string;
        actorId: string;
    };
}
export interface UserLoggedInEvent extends DomainEventPayload {
    eventType: 'user.logged_in';
    data: {
        userId: string;
        method: string;
        deviceInfo: string;
        ip: string;
    };
}
export interface UserRegisteredEvent extends DomainEventPayload {
    eventType: 'user.registered';
    data: {
        userId: string;
        method: string;
        organizationId: string;
    };
}
export interface UserCreatedEvent extends DomainEventPayload {
    eventType: 'user.created';
    data: {
        userId: string;
        role: string;
        organizationId: string;
        branchId: string;
    };
}
export interface UserUpdatedEvent extends DomainEventPayload {
    eventType: 'user.updated';
    data: {
        userId: string;
        changedFields: string[];
    };
}
export interface CourseCreatedEvent extends DomainEventPayload {
    eventType: 'course.created';
    data: {
        courseId: string;
        organizationId: string;
        branchId: string;
        title: string;
    };
}
export interface LessonCompletedEvent extends DomainEventPayload {
    eventType: 'lesson.completed';
    data: {
        userId: string;
        lessonId: string;
        courseId: string;
    };
}
export interface HomeworkSubmittedEvent extends DomainEventPayload {
    eventType: 'homework.submitted';
    data: {
        submissionId: string;
        homeworkId: string;
        studentId: string;
    };
}
export interface HomeworkGradedEvent extends DomainEventPayload {
    eventType: 'homework.graded';
    data: {
        submissionId: string;
        score: number;
        gradedBy: string;
    };
}
export interface AttendanceRecordedEvent extends DomainEventPayload {
    eventType: 'attendance.recorded';
    data: {
        recordId: string;
        studentId: string;
        classId: string;
        status: string;
        date: string;
    };
}
export interface NotificationCreatedEvent extends DomainEventPayload {
    eventType: 'notification.created';
    data: {
        notificationId: string;
        userId: string;
        type: string;
        title: string;
    };
}
export type CampusOSEvent = UserLoggedInEvent | UserRegisteredEvent | UserCreatedEvent | UserUpdatedEvent | CourseCreatedEvent | LessonCompletedEvent | HomeworkSubmittedEvent | HomeworkGradedEvent | AttendanceRecordedEvent | NotificationCreatedEvent;
//# sourceMappingURL=events.types.d.ts.map